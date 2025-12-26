import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import EmptyState from '@/components/common/EmptyState'
import styles from './PaymentFailed.module.css'

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Layout>
      <section className={styles.page}>
        <EmptyState
          type="error"
          title="Payment failed"
          message="Your payment was unsuccessful. Please try again."
          action={{
            label: 'Go to Browse',
            onClick: () => navigate('/browse')
          }}
        />
      </section>
    </Layout>
  )
}

export default PaymentFailed
