import { EventEmitter } from 'events';

export interface Options{
    statsInterval?: number;
}

export interface Bot{
    botid: string;
    votes: number;
    servers: string;
    monthly_votes: number;
    owners: string[];
    longdesc: string;
    shortdesc: string;
    certified: string;
    links: {
        invite: string;
        supportserver?: string;
        website?: string;
        github?: string;
        donate?: string;
    }
}

export interface BotReviews{
    reviews: {
        rating: string;
        responses: any[];
        flagged: boolean;
        createdAt: string;
        userid: string;
        botid: string;
        message: string;
    }[];
}

export interface BotAnalytics{
    build: string;
    analytics: {
        date: string;
        unique_views: number;
        views: number;
        votes: number;
        reviews: number;
        referrers: {
            name: string;
            value: number;
        }[];
        countries: {
            name: string;
            value: number;
        }[];
    }[];
}

export type Response<T> = T | { message: string } | { error: string };

export class VoidBots extends EventEmitter{

    public token: string;

    public constructor(token: string, options: any, client: any);
    public postStats(serverCount: number, shardCount?: number): Promise<string>;
    public hasVoted(id: string): Promise<string>;
    public getBotInfo(id: string): Promise<Response<Bot>>;
    public getReviews(id: string): Promise<Response<BotReviews>>;
    public getAnalytics(id: string): Promise<Response<BotAnalytics>>;
    public tokenAvailable(): never | boolean;

}

export const version: string;
