import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import {
    addTransactionBodySchema,
    createOrUpdateTransactionResponseSchema,
    listTransactionsParamsSchema,
    listTransactionsResponseSchema,
    retryOrReverseTransactionResponseSchema,
    updateTransactionBodySchema,
} from '../schemas/transactions.js'

const c = initContract()

/**
 * Represents the transactions router.
 */
export const transactions = c.router(
    {
        /**
         * Retrieves a list of transactions.
         * @method GET
         * @path /transactions
         * @query listTransactionsParamsSchema
         * @responses 200 - listTransactionsResponseSchema
         */
        list: {
            method: 'GET',
            path: '/',
            query: listTransactionsParamsSchema,
            responses: {
                200: listTransactionsResponseSchema,
            },
        },
        /**
         * Adds a new transaction.
         * @method POST
         * @path /transactions/:subscriptionId/:typeId/add
         * @pathParams subscriptionId - The subscription ID.
         * @pathParams typeId - The type ID (galaxPayId or myId).
         * @responses 200 - createOrUpdateTransactionResponseSchema
         * @body addTransactionBodySchema
         */
        create: {
            method: 'POST',
            path: '/:subscriptionId/:typeId/add',
            pathParams: z.object({
                subscriptionId: z.coerce.string(),
                typeId: z.enum(['galaxPayId', 'myId']),
            }),
            responses: {
                200: createOrUpdateTransactionResponseSchema,
            },
            body: addTransactionBodySchema,
        },
        /**
         * Updates an existing transaction.
         * @method PUT
         * @path /transactions/:subscriptionId/:typeId
         * @pathParams subscriptionId - The subscription ID.
         * @pathParams typeId - The type ID (galaxPayId or myId).
         * @responses 200 - createOrUpdateTransactionResponseSchema
         * @body updateTransactionBodySchema
         */
        update: {
            method: 'PUT',
            path: '/:subscriptionId/:typeId',
            pathParams: z.object({
                subscriptionId: z.coerce.string(),
                typeId: z.enum(['galaxPayId', 'myId']),
            }),
            responses: {
                200: createOrUpdateTransactionResponseSchema,
            },
            body: updateTransactionBodySchema,
        },
        /**
         * Retries a failed transaction.
         * @method PUT
         * @path /transactions/:transactionId/:typeId/retry
         * @pathParams transactionId - The transaction ID.
         * @pathParams typeId - The type ID (galaxPayId or myId).
         * @responses 200 - retryOrReverseTransactionResponseSchema
         * @body {}
         */
        retry: {
            method: 'PUT',
            path: '/:transactionId/:typeId/retry',
            pathParams: z.object({
                transactionId: z.coerce.string(),
                typeId: z.enum(['galaxPayId', 'myId']),
            }),
            responses: {
                200: retryOrReverseTransactionResponseSchema,
            },
            body: z.object({}),
        },
        /**
         * Reverses a transaction.
         * @method PUT
         * @path /transactions/:transactionId/:typeId/reverse
         * @pathParams transactionId - The transaction ID.
         * @pathParams typeId - The type ID (galaxPayId or myId).
         * @responses 200 - retryOrReverseTransactionResponseSchema
         * @body valueToReverse - The value to reverse (optional).
         */
        reverse: {
            method: 'PUT',
            path: '/:transactionId/:typeId/reverse',
            pathParams: z.object({
                transactionId: z.coerce.string(),
                typeId: z.enum(['galaxPayId', 'myId']),
            }),
            responses: {
                200: retryOrReverseTransactionResponseSchema,
            },
            body: z.object({
                valueToReverse: z.coerce.number().optional(),
            }),
        },
        /**
         * Captures a transaction.
         * @method PUT
         * @path /transactions/:transactionId/:typeId/capture
         * @pathParams transactionId - The transaction ID.
         * @pathParams typeId - The type ID (galaxPayId or myId).
         * @responses 200 - createOrUpdateTransactionResponseSchema
         * @body {}
         */
        capture: {
            method: 'PUT',
            path: '/:transactionId/:typeId/capture',
            pathParams: z.object({
                transactionId: z.coerce.string(),
                typeId: z.enum(['galaxPayId', 'myId']),
            }),
            responses: {
                200: createOrUpdateTransactionResponseSchema,
            },
            body: z.object({}),
        },
        /**
         * Cancels a transaction.
         * @method DELETE
         * @path /transactions/:transactionId/:typeId
         * @pathParams transactionId - The transaction ID.
         * @pathParams typeId - The type ID (galaxPayId or myId).
         * @responses 200 - { type: boolean }
         * @body {}
         */
        cancel: {
            method: 'DELETE',
            path: '/:transactionId/:typeId',
            pathParams: z.object({
                transactionId: z.coerce.string(),
                typeId: z.enum(['galaxPayId', 'myId']),
            }),
            responses: {
                200: z.object({
                    type: z.boolean(),
                }),
            },
            body: z.object({}),
        },
    },
    { pathPrefix: '/transactions' },
)
