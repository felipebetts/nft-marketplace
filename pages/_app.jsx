import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav
        className='border-b p-6'
      >
        <div className="flex items-end">
          <h1 
            className='text-4xl font-bold'
          >
            Tokenizei
          </h1>
          <h3 
            className='text-2xl pl-2'
          >
            NFT Marketplace
          </h3>
        </div>
        <div
          className='flex mt-4'
        >
          <Link href='/'>
            <a className='mr-6 text-pink-500'>
              Home
            </a>
          </Link>
          <Link href='/create-item'>
            <a className='mr-6 text-pink-500'>
              Sell
            </a>
          </Link>
          <Link href='/my-assets'>
            <a className='mr-6 text-pink-500'>
              My NFTs
            </a>
          </Link>
          <Link href='/creator-dashboard'>
            <a className='mr-6 text-pink-500'>
              My Listings
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
