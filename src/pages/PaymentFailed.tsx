import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '@/components/layout/Layout'
import EmptyState from '@/components/common/EmptyState'
import styles from './PaymentFailed.module.css'

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Layout>
      <section className={styles.page}>
        <EmptyState
          type="error"
          title={t('payment.failed.title')}
          message={t('payment.failed.message')}
          action={{
            label: t('common.goToBrowse'),
            onClick: () => navigate('/browse')
          }}
        />
      </section>
    </Layout>
  )
}

export default PaymentFailed
