import React, { useEffect } from 'react'
import Layout from '../layout/Layout'
import PrivacyPolicy from '../privacy-policy/PrivacyPolicy'
import { useSelector } from 'react-redux'

const PrivacyPolicyPage = () => {
  const language = useSelector(state => state.Language.selectedLanguage)

  useEffect(() => { }, [language?.id])
  return (
    <Layout>
      <PrivacyPolicy />
    </Layout>
  )
}

export default PrivacyPolicyPage
