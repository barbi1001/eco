import type {
  JewelryTemplate,
  JewelryComponent,
  StrapiResponse,
  StrapiTemplate,
  StrapiComponent
} from '$lib/types/jewelry';
import { transformStrapiTemplate, transformStrapiComponent } from '$lib/utils/jewelryHelpers';
import { createRetryWrapper, retryConfigs } from '$lib/utils/retryMechanism';
import { PUBLIC_STRAPI_URL } from '$lib/config/strapi';

// Strapi configuration
const STRAPI_URL = PUBLIC_STRAPI_URL;

// This client runs in the browser and is READ-ONLY (templates + components).
//
// `VITE_`-prefixed variables are inlined into the browser bundle by Vite, so this
// token is public. It is kept only because the read collections may still require
// it; the correct end state is to make `jewelry-templates` and `jewelry-components`
// publicly readable in Strapi and drop this entirely.
// Every WRITE goes through a server endpoint with a private token
// (see src/lib/server/strapi.ts). Do not add write calls here.
const STRAPI_API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;

/**
 * Base API client for Strapi requests
 */
class StrapiClient {
  private baseUrl: string;
  private apiToken?: string;

  constructor(baseUrl: string, apiToken?: string) {
    this.baseUrl = baseUrl;
    this.apiToken = apiToken;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params) : null;
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

}

// Create client instance
const strapiClient = new StrapiClient(STRAPI_URL, STRAPI_API_TOKEN);

/**
 * Jewelry Templates API
 */
export const templatesApi = {
  /**
   * Get all active jewelry templates with retry mechanism
   */
  getAll: createRetryWrapper(async (): Promise<JewelryTemplate[]> => {
    const response = await strapiClient.get<StrapiResponse<StrapiTemplate[]>>(
      '/jewelry-templates',
      {
        'populate': '*',
        'filters[is_active][$eq]': 'true',
        'sort': 'name:asc'
      }
    );

    return response.data.map(transformStrapiTemplate);
  }, retryConfigs.templates),

  /**
   * Get a specific template by ID with retry mechanism
   */
  getById: createRetryWrapper(async (id: string): Promise<JewelryTemplate> => {
    const response = await strapiClient.get<StrapiResponse<StrapiTemplate>>(
      `/jewelry-templates/${id}`,
      { 'populate': '*' }
    );

    return transformStrapiTemplate(response.data);
  }, retryConfigs.templates),

  /**
   * Get templates by category with retry mechanism
   */
  getByCategory: createRetryWrapper(async (category: string): Promise<JewelryTemplate[]> => {
    const response = await strapiClient.get<StrapiResponse<StrapiTemplate[]>>(
      '/jewelry-templates',
      {
        'populate': '*',
        'filters[category][$eq]': category,
        'filters[is_active][$eq]': 'true',
        'sort': 'name:asc'
      }
    );

    return response.data.map(transformStrapiTemplate);
  }, retryConfigs.templates)
};

/**
 * Jewelry Components API
 */
export const componentsApi = {
  /**
   * Get all active jewelry components with retry mechanism
   */
  getAll: createRetryWrapper(async (): Promise<JewelryComponent[]> => {
    const response = await strapiClient.get<StrapiResponse<StrapiComponent[]>>(
      '/jewelry-components',
      {
        'populate': '*',
        'filters[is_active][$eq]': 'true',
        'sort': 'name:asc',
        'pagination[pageSize]': '100'
      }
    );

    return response.data.map(transformStrapiComponent);
  }, retryConfigs.components),

  /**
   * Get components by type with retry mechanism
   */
  getByType: createRetryWrapper(async (type: string): Promise<JewelryComponent[]> => {
    const response = await strapiClient.get<StrapiResponse<StrapiComponent[]>>(
      '/jewelry-components',
      {
        'populate': '*',
        'filters[component_type][$eq]': type,
        'filters[is_active][$eq]': 'true',
        'sort': 'name:asc',
        'pagination[pageSize]': '100'
      }
    );

    return response.data.map(transformStrapiComponent);
  }, retryConfigs.components),

  /**
   * Search components by name or material with retry mechanism
   */
  search: createRetryWrapper(async (query: string): Promise<JewelryComponent[]> => {
    const response = await strapiClient.get<StrapiResponse<StrapiComponent[]>>(
      '/jewelry-components',
      {
        'populate': '*',
        'filters[$or][0][name][$containsi]': query,
        'filters[$or][1][material][$containsi]': query,
        'filters[is_active][$eq]': 'true',
        'sort': 'name:asc'
      }
    );

    return response.data.map(transformStrapiComponent);
  }, retryConfigs.components)
};

export default strapiClient;
