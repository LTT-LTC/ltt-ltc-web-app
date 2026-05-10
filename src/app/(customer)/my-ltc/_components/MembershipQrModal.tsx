'use client';

import React from 'react';
import LTTModal from '@/src/@core/component/AntD/LTTModal';
import { useLocalization } from '@/src/@core/hooks/use-localization';

export type MembershipQrModalProps = {
  open: boolean;
  onClose: () => void;
  qrUrl: string | null;
  customerName: string;
  cardNumberDisplay: string;
};

export default function MembershipQrModal({
  open,
  onClose,
  qrUrl,
  customerName,
  cardNumberDisplay,
}: MembershipQrModalProps) {
  const { t } = useLocalization();

  return (
    <LTTModal
      open={open}
      onCancel={onClose}
      footer={null}
      width={440}
      destroyOnHidden
      title={null}
      className="[&_.ant-modal-content]:!rounded-2xl [&_.ant-modal-content]:!p-0 [&_.ant-modal-content]:overflow-hidden"
    >
      <div className="flex flex-col items-center gap-4 px-6 py-8 bg-white">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-inner">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt={t('customer.my_ltc.membership_card.qr_enlarged_alt')}
              className="h-64 w-64 object-contain"
            />
          ) : (
            <div className="flex h-64 w-64 items-center justify-center bg-gray-50 text-sm text-gray-400">
              —
            </div>
          )}
        </div>
        <p className="text-center text-xl font-black uppercase tracking-tight text-gray-900">{customerName}</p>
        <p className="text-center font-mono text-base tracking-[0.2em] text-gray-700">{cardNumberDisplay}</p>
      </div>
    </LTTModal>
  );
}
