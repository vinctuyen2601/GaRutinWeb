const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export async function fetchApi<T>(path: string, options?: RequestInit & { revalidate?: number }): Promise<T> {
  const { revalidate, ...fetchOptions } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    next: revalidate !== undefined ? { revalidate } : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`);
  return res.json();
}

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  images: string[];
  categoryId?: string;
  weightPerUnit?: string;
  unit: string;
  stockStatus: 'in_stock' | 'out_of_stock' | 'pre_order';
  isFeatured: boolean;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  status: string;
  publishedAt?: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
};

export const getProducts = (params?: string) =>
  fetchApi<Product[]>(`/products${params ? `?${params}` : ''}`, { revalidate: 1800 });

export const getProduct = (slug: string) =>
  fetchApi<Product>(`/products/${slug}`, { revalidate: 1800 });

export const getPosts = (params?: string) =>
  fetchApi<Post[]>(`/posts${params ? `?${params}` : ''}`, { revalidate: 3600 });

export const getPost = (slug: string) =>
  fetchApi<Post>(`/posts/${slug}`, { revalidate: 3600 });

export const getCategories = () =>
  fetchApi<Category[]>('/categories', { revalidate: 3600 });

export const getSiteConfig = () =>
  fetchApi<Record<string, string>>('/site-config', { revalidate: 3600 });

export type GalleryItem = {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  source: 'admin' | 'customer';
  customerName?: string;
  createdAt?: string;
};

export const getGallery = (params?: string) =>
  fetchApi<GalleryItem[]>(`/gallery${params ? `?${params}` : ''}`, { revalidate: 3600 });
