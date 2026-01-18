import './App.css'
import BackendLiveIndicator from './components/BackendLiveIndicator'
import ConnectWallet from './components/ConnectWallet'
import TokenApprovalForm from './components/TokenApprovalForm'
import WalletInfo from './components/WalletInfo'

function App() {
  return (
    <>
      <h1>Token Approval Demo (TESTNET ONLY)</h1>
      <BackendLiveIndicator />
      <ConnectWallet />
      <WalletInfo />
      <TokenApprovalForm />
    </>
  )
}

export default App
