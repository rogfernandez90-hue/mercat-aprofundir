import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'f45uvnj2', // <--- POSA EL TEU CODI AQUÍ
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true, // Això fa que la web vagi ràpida com un llamp
})

const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}