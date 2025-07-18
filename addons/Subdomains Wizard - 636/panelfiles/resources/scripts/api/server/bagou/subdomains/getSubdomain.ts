import useSWR from 'swr';
import http, { getPaginationSet } from '@/api/http';
import { ServerContext } from '@/state/server';
import { createContext, useContext } from 'react';

interface ctx {
    page: number;
    setPage: (value: number | ((s: number) => number)) => void;
}
interface Link {
    url: string | null;
    label: string;
    active: boolean;
}

interface DomainData {
    id: number;
    name: string;
}
export interface SubdomainData {
    id: number;
    domain: DomainData;
    domain_id: number;
    created_at: string;
    type: string;
    name: string;
}

interface Pagination {
    current_page: number;
    data: SubdomainData[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Link[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface TemplateItem {
    id: number;
    name: string;
    domain: string;
}

interface SubDomainResult {
    domains: Pagination;
    templates: TemplateItem[];
}

const Context = createContext<ctx>({ page: 1, setPage: () => 1 });

export default () => {
    const { page, setPage } = useContext(Context);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    return useSWR<SubDomainResult>( // use SubDomainResult as the return type of useSWR
        ['server:subdomains', uuid, page],
        async () => {
            const { data } = await http.get(`/api/client/servers/${uuid}/subdomains?page=${page}`);

            return {
                domains: data.domains,
                templates: data.template,
            };
        },
        {
            onSuccess(data) {
                // no more pages, don't increment page number
                if (data.domains.current_page >= data.domains.last_page) {
                    setPage(page);
                } else {
                    setPage(prevPage => prevPage + 1);
                }
            },
        }
    );
};
