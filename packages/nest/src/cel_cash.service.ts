import {
    antecipation,
    auth,
    cards,
    chargebacks,
    charges,
    companies,
    customers,
    pix,
    plans,
    subscriptions,
    transactions,
    transfer,
} from '@cel_cash/core/contracts'
import type {
    Antecipation,
    Cards,
    Chargebacks,
    Charges,
    Companies,
    Customers,
    Pix,
    Plans,
    Subscriptions,
    Transactions,
    Transfer,
} from '@cel_cash/core/contracts'
import { api, basicAuthorization } from '@cel_cash/core/utils'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { type ApiFetcherArgs, initClient } from '@ts-rest/core'
import type { Cache } from 'cache-manager'
import { InjectCelCashConfig } from './cel_cash.config'
import type { CelCashServiceOptions } from './interfaces'

interface CelCashServiceConfig {
    baseUrl: string
    api: (args: ApiFetcherArgs) => Promise<{
        status: number
        body: unknown
        headers: Headers
    }>
}

@Injectable()
export class CelCashService implements OnModuleInit {
    public static readonly CACHE = {
        ROOT: 'cel_cash',
        ACCESS_TOKEN: 'cel_cash:access_token',
    } as const

    private readonly logger = new Logger(CelCashService.name)

    private readonly config: CelCashServiceConfig

    constructor(
        @InjectCelCashConfig()
        private readonly cellCashServiceOptions: CelCashServiceOptions,
        @Inject(CACHE_MANAGER)
        private readonly cacheManage: Cache,
    ) {
        this.config = {
            baseUrl: this.cellCashServiceOptions.base_url,
            api: async (args: ApiFetcherArgs) => {
                const access_token = await this.getAccessToken()

                args.headers = {
                    ...args.headers,
                    Authorization: `Bearer ${access_token}`,
                }

                this.logger.log(`Requesting ${args.path}`)
                return api(args)
                    .then(res => {
                        this.logger.log(`Response ${args.path}`)
                        return res
                    })
                    .catch(err => {
                        this.logger.error(`Error ${args.path}`)
                        throw err
                    })
            },
        }
    }

    public onModuleInit() {
        this.logger.log('Initialized...')
    }

    public get antecipation(): Antecipation {
        return initClient(antecipation, this.config)
    }

    public get cards(): Cards {
        return initClient(cards, this.config)
    }

    public get charges(): Charges {
        return initClient(charges, this.config)
    }

    public get chargebacks(): Chargebacks {
        return initClient(chargebacks, this.config)
    }

    public get companies(): Companies {
        return initClient(companies, this.config)
    }

    public get pix(): Pix {
        return initClient(pix, this.config)
    }

    public get transfer(): Transfer {
        return initClient(transfer, this.config)
    }

    public get transactions(): Transactions {
        return initClient(transactions, this.config)
    }

    // public get webhook() {
    //     return initClient()
    // }

    public get plans(): Plans {
        return initClient(plans, this.config)
    }

    public get customers(): Customers {
        return initClient(customers, this.config)
    }

    public get subscriptions(): Subscriptions {
        return initClient(subscriptions, this.config)
    }

    private async getAccessToken() {
        const access_token = await this.cacheManage.get<string>(
            CelCashService.CACHE.ACCESS_TOKEN,
        )

        if (!access_token) {
            const client = initClient(auth, {
                baseUrl: this.cellCashServiceOptions.base_url,
                baseHeaders: {},
                api,
            })

            const authorization = basicAuthorization({
                ID: this.cellCashServiceOptions.id,
                HASH: this.cellCashServiceOptions.hash,
            })

            const authorization_code = await client.token({
                body: {
                    grant_type: 'authorization_code',
                    scope: [
                        'customers.read',
                        'customers.write',
                        'plans.read',
                        'plans.write',
                        'transactions.read',
                        'transactions.write',
                        // "webhooks.write",
                        'cards.read',
                        'cards.write',
                        'card-brands.read',
                        'subscriptions.read',
                        'subscriptions.write',
                        'charges.read',
                        'charges.write',
                        'boletos.read',
                        'carnes.read',
                        'payment-methods.read',
                        'antecipation.read',
                        'antecipation.write',
                    ],
                },
                headers: {
                    authorization,
                },
            })

            if (authorization_code.status === 200) {
                await this.cacheManage.set(
                    CelCashService.CACHE.ACCESS_TOKEN,
                    authorization_code.body.access_token,
                    authorization_code.body.expires_in,
                )

                return authorization_code.body.access_token
            }

            throw new Error('Error on get access_token')
        }

        return access_token
    }
}
