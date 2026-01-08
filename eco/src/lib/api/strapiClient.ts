import type {
  JewelryTemplate,
  JewelryComponent,
  CustomJewelryOrder,
  StrapiResponse,
  StrapiTemplate,
  StrapiComponent
} from '$lib/types/jewelry';
import { transformStrapiTemplate, transformStrapiComponent } from '$lib/utils/jewelryHelpers';
import { createRetryWrapper, retryConfigs } from '$lib/utils/retryMechanism';

// Strapi configuration
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
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

  async uploadFile(file: File, refId?: string, ref?: string, field?: string): Promise<any> {
    const formData = new FormData();
    formData.append('files', file);
    
    if (refId) formData.append('refId', refId);
    if (ref) formData.append('ref', ref);
    if (field) formData.append('field', field);

    const headers: HeadersInit = {};
    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
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

/**
 * Custom Orders API
 */
export const ordersApi = {
  /**
   * Create a new custom jewelry order
   */
  async create(order: Omit<CustomJewelryOrder, 'id' | 'orderDate'>): Promise<CustomJewelryOrder> {
    try {
      const orderData = {
        data: {
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          customer_message: order.customerMessage || '',
          design_configuration: order.designConfiguration,
          total_price: order.totalPrice,
          order_status: order.orderStatus,
          order_date: new Date().toISOString()
        }
      };

      const response = await strapiClient.post<StrapiResponse<any>>(
        '/custom-jewelry-orders',
        orderData
      );

      return {
        id: response.data.id.toString(),
        customerName: response.data.attributes.customer_name,
        customerPhone: response.data.attributes.customer_phone,
        customerMessage: response.data.attributes.customer_message,
        designConfiguration: response.data.attributes.design_configuration,
        totalPrice: response.data.attributes.total_price,
        orderStatus: response.data.attributes.order_status,
        orderDate: new Date(response.data.attributes.order_date)
      };
    } catch (error) {
      console.error('Failed to create order:', error);
      throw new Error('Failed to submit jewelry order');
    }
  },

  /**
   * Upload design preview image for an order
   */
  async uploadPreviewImage(orderId: string, imageBlob: Blob): Promise<string> {
    try {
      const file = new File([imageBlob], `design-preview-${orderId}.png`, {
        type: 'image/png'
      });

      const uploadResponse = await strapiClient.uploadFile(
        file,
        orderId,
        'api::custom-jewelry-order.custom-jewelry-order',
        'design_preview'
      );

      return uploadResponse[0]?.url || '';
    } catch (error) {
      console.error('Failed to upload preview image:', error);
      throw new Error('Failed to upload design preview');
    }
  }
};

/**
 * Health check for Strapi connection
 */
export async function checkStrapiConnection(): Promise<boolean> {
  try {
    await strapiClient.get('/jewelry-templates', { 'pagination[limit]': '1' });
    return true;
  } catch (error) {
    console.error('Strapi connection failed:', error);
    return false;
  }
}

export default strapiClient;