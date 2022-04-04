import React, { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import {
  useAddress,
  useDisconnect,
  useMetamask,
  useNFTDrop,
} from '@thirdweb-dev/react'
import { sanityClient, urlFor } from '../../sanity'
import { Collection } from '../../typing'
import { BigNumber } from 'ethers'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'

interface Props {
  collection: Collection
}

const NFTDropPage = ({ collection }: Props) => {
  const [claimedSupply, setClaimedSupply] = useState<number>(0)
  const [totalSupply, setTotalSupply] = useState<BigNumber>(BigNumber.from(0))
  const [priceInEth, setPriceInEth] = useState<string>('...')
  const [loading, setLoading] = useState<boolean>(true)
  const nftDrop = useNFTDrop(collection.address)

  //Auth
  const connectWithMetaMask = useMetamask()
  const address = useAddress()
  const disconnect = useDisconnect()

  useEffect(() => {
    if (!nftDrop) return

    const fetchPrice = async () => {
      const claimConditions = await nftDrop.claimConditions.getAll()
      // console.log(claimConditions)
      setPriceInEth(claimConditions?.[0].currencyMetadata.displayValue)
    }
    fetchPrice()
  }, [nftDrop]) //nftDrop would change and detect when login or logout, so the usEffect would run when login our logout

  useEffect(() => {
    if (!nftDrop) return

    const fetchNFTDropData = async () => {
      setLoading(true)
      const claimed = await nftDrop.getAllClaimed()
      const total = await nftDrop.totalSupply()
      // console.log(total)
      setClaimedSupply(claimed.length)
      setTotalSupply(total) //it is BigNumber;

      setLoading(false)
    }

    fetchNFTDropData()
  }, [nftDrop, address])

  const mintNFt = () => {
    if (!nftDrop || !address) return

    setLoading(true)
    const notification = toast.loading('Minting NFT...', {
      style: {
        background: 'white',
        color: 'green',
        fontWeight: 'bolder',
        fontSize: '17px',
        padding: '20px',
      },
    })

    const quantity = 1 // how many unique NFTs you want to claim

    nftDrop
      .claimTo(address, quantity)
      .then(async (tx) => {
        const receipt = tx[0].receipt // the transaction receipt
        const claimedTokenId = tx[0].id // the id of the token you claimed
        const claimedNFT = await tx[0].data() // the NFT you claimed

        toast('Hooray! You just minted a NFT!', {
          duration: 8000,
          style: {
            background: 'green',
            color: 'white',
            fontWeight: 'bolder',
            fontSize: '17px',
            padding: '20px',
          },
        })

        //if successfully
        setClaimedSupply((prev) => prev + quantity)

        // console.log(receipt)
        // console.log(claimedTokenId)
        // console.log(claimedNFT)
      })
      .catch((error) => {
        console.log(error)
        toast('Whoops! Something went wrong!', {
          style: {
            background: 'red',
            color: 'white',
            fontWeight: 'bolder',
            fontSize: '17px',
            padding: '20px',
          },
        })
      })
      .finally(() => {
        setLoading(false)
        console.log('setLoaidng to false')
        toast.dismiss(notification) //this should be called whatever, or this notification would keep showing on the screen
      })
  }

  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-10">
      <Toaster position="bottom-center" />
      {/* Left */}
      <div className="bg-gradient-to-br from-cyan-800 to-rose-500 lg:col-span-4">
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
          <div className="rounded-xl bg-gradient-to-br from-yellow-400 to-purple-600 p-2">
            <img
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
              src={urlFor(collection.previewImage)}
              alt="side-picture"
            />
          </div>
          <div className="space-y-2 p-5 text-center">
            <h1 className="text-3xl font-bold text-white">
              {collection.nftCollectionName}
            </h1>
            <h2 className="text-xl text-gray-300">{collection.description}</h2>
          </div>
        </div>
      </div>
      {/* Right */}
      <div className="flex flex-1 flex-col p-6 lg:col-span-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/">
            <h1 className="w-28 cursor-pointer text-xl font-extralight sm:w-80">
              <span className=" font-extrabold underline decoration-pink-600/50">
                {collection.creator.name}
              </span>{' '}
              NFT Market Place
            </h1>
          </Link>
          <button
            onClick={() => (address ? disconnect() : connectWithMetaMask())}
            className="rounded-full bg-rose-400 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600 lg:px-5 lg:py-3 lg:text-base"
          >
            {!address ? 'Sign In' : 'Sing Out'}
          </button>
        </header>
        <hr className="my-2 border" />
        {address && (
          <p className="text-center text-sm text-rose-400">
            You're logged in with an wallet {address.substring(0, 5)}...
            {address.substring(address.length - 5)}
          </p>
        )}
        {/* Content */}
        <div className="mt-10 flex flex-1 flex-col items-center space-y-2 text-center lg:justify-center lg:space-y-0">
          <img
            className="w-80 object-cover pb-10 lg:h-40"
            src={urlFor(collection.mainImage)}
            alt="content-pic"
          />
          <h1 className="text-2xl font-bold lg:text-4xl lg:font-extrabold">
            {collection.title}
          </h1>

          {loading ? (
            <p className="animate-pulse pt-2 text-xl text-green-500">
              Loading Supply Count...
            </p>
          ) : (
            <p className="pt-2 text-xl text-green-500">
              {claimedSupply} / {totalSupply.toString()} NFT's claimed
            </p>
          )}

          {loading && (
            <img
              className="h-40 w-40 object-contain"
              src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif"
              alt="loading image"
            />
          )}
        </div>
        {/* Mint Button */}

        <button
          onClick={mintNFt}
          disabled={
            loading || claimedSupply === totalSupply.toNumber() || !address
          }
          className="mt-10 h-12 w-full rounded-full bg-red-600 font-bold text-white hover:bg-red-400 disabled:bg-gray-400 lg:h-16"
        >
          {loading ? (
            'Loading...'
          ) : claimedSupply === totalSupply.toNumber() ? (
            'SOLD OUT'
          ) : !address ? (
            'Sign In to Mint'
          ) : (
            <span>Mint NFT ({priceInEth} ETH)</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default NFTDropPage

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `*[_type == "collection" && slug.current == $id][0]{
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

  //return null if no collection found
  const collection = await sanityClient.fetch(query, { id: params?.id })

  if (!collection) {
    return {
      notFound: true, //this would return 404 page
    }
  }

  return {
    props: {
      collection,
    },
  }
}
