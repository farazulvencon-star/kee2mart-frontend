import React from 'react'
import BreadCrumb from '../breadcrumb/BreadCrumb'
import { useSelector } from 'react-redux'
import { isEmptyHtml } from '@/lib/utils'
import { t } from '@/utils/translation'
import NoInfoData from '../common/NoInfoData'

const PrivacyPolicy = () => {
    const setting = useSelector((state) => state?.Setting?.setting);
    return (
        <section>
            <div>
                <BreadCrumb />
            </div>
            {isEmptyHtml(setting?.privacy_policy) ? (
                <NoInfoData title={t('privacy_policy')} />
            ) : (
                <div className='container my-5 bodyBackgroundColor px-1 md:px-0 '>
                    <div
                        className='flex flex-col gap-4 rounded p-4 items-start [&_ul]:list-disc [&_ul]:pl-5 backgroundColor infoContent [&_a]:text-[revert] [&_a]:underline md:p-7'
                        dangerouslySetInnerHTML={{
                            __html: setting?.privacy_policy,
                        }}
                    />
                </div>
            )}
        </section>
    )
}

export default PrivacyPolicy
