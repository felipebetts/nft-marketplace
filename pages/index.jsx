import { ethers } from "ethers"
import Web3Modal from 'web3modal'
import { useState, useEffect } from "react"
import Head from 'next/head'

import {
  nftaddress,
  nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import axios from "axios"

export default function Home() {

  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadNfts()
  }, [])

  async function loadNfts() {
    // because this is a read operation, there's no need to get the users info
    // given that, we can use a very simple ethers provider
    const provider = new ethers.providers.JsonRpcProvider('https://matic-mumbai.chainstacklabs.com')
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)

    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(data.map(async e => {
      const tokenUri = await tokenContract.tokenURI(e.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(e.price.toString(), 'ether')
      let item = {
        price,
        tokenId: e.tokenId.toNumber(),
        seller: e.seller,
        owner: e.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))

    setNfts(items)
    setLoadingState('loaded')
  }

  if (loadingState === 'loaded' && !nfts.length) {
    return <h1 className='px-20 py-10 text-3xl'>No items in marketplace</h1>
  }

  async function buyNft(nft) {
    // this will connect to wallet and then perform the transaction
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner() // user
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, { value: price })

    await transaction.wait()
    // after transaction is finished, reload the nft list to indicate the purchase
    loadNfts()
  }

  if (loadingState === 'not-loaded') {
    return (
      <div className='flex justify-center p-12'>
        <h3 className="text-2xl">
          Loading...
        </h3>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>
          Tokenizei
        </title>
      </Head>
      <div className='flex justify-center'>
        <div
          className="px-4"
          style={{ maxWidth: '1600px' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {nfts.map((nft, i) => (
              <div
                key={i}
                className="border shadow rounded-xl overflow-hidden"
              >
                <img src={nft.image} alt={`nft_${i}`} />
                <div className="p-4">
                  <p
                    style={{ height: '64px' }}
                    className="text-2xl font-semibold"
                  >
                    {nft.name}
                  </p>
                  <div
                    style={{ height: '70px', overflow: 'hidden' }}
                  >
                    <p className="text-gray-400">
                      {nft.description}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">
                    {nft.price} MATIC
                  </p>
                  <button
                    className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                    onClick={() => buyNft(nft)}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
