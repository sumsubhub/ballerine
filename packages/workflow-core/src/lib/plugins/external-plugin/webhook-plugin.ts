import { ApiPlugin } from './api-plugin';
import { TContext } from '../../utils/types';
import { IApiPluginParams } from './types';
import { logger } from '../../logger';
import { AnyRecord, sign } from '@ballerine/common';

export class WebhookPlugin extends ApiPlugin {
  public static pluginType = 'http';
  constructor(pluginParams: IApiPluginParams) {
    super(pluginParams);
  }

  // TODO: Ensure if this is intentional
  async invoke(context: TContext) {
    let requestPayload;

    if (this.request && 'transformers' in this.request && this.request.transformers) {
      requestPayload = await this.transformData(this.request.transformers, context);
    }

    try {
      const urlWithoutPlaceholders = await this.replaceValuePlaceholders(this.url, context);

      logger.log('Webhook Plugin - Sending API request', {
        url: urlWithoutPlaceholders,
        method: this.method,
      });

      const apiResponse = await this.makeApiRequest(
        urlWithoutPlaceholders,
        this.method,
        requestPayload,
        await this.composeRequestSignedHeaders(this.headers!, context, requestPayload),
      );

      logger.log('Webhook Plugin - Received response', {
        status: apiResponse.statusText,
        url: urlWithoutPlaceholders,
      });

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        let responseBody = result as AnyRecord;

        if (this.response?.transformers) {
          responseBody = await this.transformData(this.response.transformers, result as AnyRecord);
        }

        const { isValidResponse, errorMessage } = await this.validateContent(
          this.response!.schemaValidator,
          responseBody,
          'Response',
        );

        if (!isValidResponse) {
          return this.returnErrorResponse(errorMessage!);
        }

        if (this.successAction) {
          return this.returnSuccessResponse(this.successAction, {
            ...responseBody,
          });
        }

        return {};
      } else {
        const errorResponse = await apiResponse.json();

        return this.returnErrorResponse(
          'Request Failed: ' + apiResponse.statusText + ' Error: ' + JSON.stringify(errorResponse),
        );
      }
    } catch (err) {
      logger.error('Error occurred while sending an API request', { err });
    }

    return {};
  }

  async composeRequestSignedHeaders(
    headers: HeadersInit,
    context: TContext,
    payload: AnyRecord | undefined,
  ) {
    const secrets = await this.secretsManager?.getAll();
    const webhookSharedSecret = secrets?.['webhookSharedSecret'];

    if (secrets && webhookSharedSecret) {
      headers = {
        ...headers,
        'X-HMAC-Signature': sign({ payload, key: webhookSharedSecret }),
      };
    }

    const headersEntries = await Promise.all(
      Object.entries(headers).map(async header => [
        header[0],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.replaceValuePlaceholders(header[1], context),
      ]),
    );

    return Object.fromEntries(headersEntries);
  }
}
