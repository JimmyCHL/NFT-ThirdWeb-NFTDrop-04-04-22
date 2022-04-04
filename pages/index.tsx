import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { sanityClient, urlFor } from '../sanity'
import { Collection } from '../typing'
import Link from 'next/link'
import { ReactNode } from 'react'

interface Props {
  collections: Collection[]
  children?: ReactNode
}

const Home: NextPage<Props> = ({ collections }: Props) => {
  console.log(collections)
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col py-20 px-10 2xl:px-0 ">
      <Head>
        <title>NFT Drop Challenge</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="mb-10 text-center text-3xl font-extralight">
        <span className=" font-extrabold underline decoration-pink-600/50">
          Jimmy
        </span>{' '}
        NFT Market Place
      </h1>

      <main className="bg-slate-100 p-10 shadow-xl shadow-rose-400/20">
        <div className="grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {collections.map((collection, i) => (
            <Link href={`/nft/${collection.slug.current}`}>
              <div
                key={i}
                className="ease flex cursor-pointer flex-col items-center transition-all duration-200 hover:scale-105"
              >
                <img
                  className="h-96 w-60 rounded-2xl object-cover"
                  src={urlFor(collection.mainImage)}
                  alt="main-image"
                />{' '}
                <div className="p-5">
                  <h2 className="text-2xl font-bold">{collection.title}</h2>
                  <p className="mt-2 text-sm text-gray-400">
                    {collection.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Home

export const getStaticProps: GetServerSideProps = async () => {
  const query = `*[_type == "collection"]{
    _id,
    title,
    address,
    nftCollectionName,
    description,
    mainImage{
    asset
  },
  previewImage{
    asset
  },
   slug{
     current
   },
  creator ->{
    _id,
    name,
    address,
    slug{
    current
  }
  }
  }`

  const collections = await sanityClient.fetch(query)
  console.log(collections)

  return {
    props: {
      collections,
    },
  }
}
