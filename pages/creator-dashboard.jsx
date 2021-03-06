import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
    nftaddress,
    nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

const CreatorDashboard = () => {

    const [nfts, setNfts] = useState([]) // nfts created by user
    const [sold, setSold] = useState([]) // nfts sold by user

    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
        loadNfts()
    }, [])

    async function loadNfts() {
        const web3modal = new Web3Modal()
        const connection = await web3modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await marketContract.fetchItemsCreated()

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
        const soldItems = items.filter(e => e.sold)

        setNfts(items)
        setSold(soldItems)
        setLoadingState('loaded')
    }

    if (loadingState === 'loaded' && !nfts.length) {
        return <h1 className='px-20 py-10 text-3xl'>No items created yet</h1>
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
        <div>
            <div className="p-4">
                <div className="text-2xl py-2">
                    <h2 className="text-2xl py-2">Items created</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        {nfts.map((nft, i) => (
                            <div key={i} className="flex flex-col justify-between border shadow rounded-xl overflow-hidden">
                                <img src={nft.image} alt="" className="rounded" />
                                <div className="p-4 bg-black">
                                    <p className="text-2xl font-bold text-white">
                                        Price - {nft.price} MATIC
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="px-4">
                {Boolean(sold.length) && (
                    <div>
                        <h2 className="text-2xl py-2">Items sold</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                            {sold.map((nft, i) => (
                                <div key={i} className="border shadow rounded-xl overflow-hidden">
                                    <img src={nft.image} alt="" className="rounded" />
                                    <div className="p-4 bg-black">
                                        <p className="text-2xl font-bold text-white">
                                            Price - {nft.price} MATIC
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CreatorDashboard