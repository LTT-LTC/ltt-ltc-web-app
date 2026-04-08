'use client';
import { useState, useMemo } from 'react';
import { Tag, Typography, Descriptions, Form, Input } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import LTTTable from '@/src/@core/component/AntD/LTTTable';
import LTTButton from '@/src/@core/component/AntD/LTTButton';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import LTTBreadcrumb from '@/src/@core/component/AntD/LTTBreadcrumb';
import LTTModal from '@/src/@core/component/AntD/LTTModal';
import RefundsFilter from '../Filter';
import { getColumns } from '../table.type';
import { RefundRequest, mockRefunds } from '../_mock/data';

export default function RefundsListPage() {
  const [items, setItems] = useState<RefundRequest[]>(mockRefunds);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [viewItem, setViewItem] = useState<RefundRequest | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [form] = Form.useForm();

  const filtered = useMemo(() => {
    let list = items;
    if (status !== 'all') list = list.filter(i => i.status === status);
    if (search) list = list.filter(i => i.customerName.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [items, search, status]);

  const handleApprove = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, status: 'approved' } : i));
  };

  const handleReject = (values: any) => {
    setItems(items.map(i => i.id === rejectModal.id ? { ...i, status: 'rejected' } : i));
    setRejectModal({ open: false, id: '' });
    form.resetFields();
  };

  return (
    <>
      <LTTBreadcrumb items={[{ title: 'Duyệt hoàn tiền' }]} />
      <LTTCard title="Duyệt hoàn tiền" className="mt-4">
        <RefundsFilter search={search} onSearch={setSearch} status={status} onStatus={setStatus} />
        <LTTTable rowKey="id" columns={getColumns(setViewItem, handleApprove, (id) => setRejectModal({ open: true, id }))} dataSource={filtered} />
      </LTTCard>

      <LTTModal open={!!viewItem} onCancel={() => setViewItem(null)} title="Chi tiết hoàn tiền" footer={null}>
        {viewItem && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Khách hàng">{viewItem.customerName}</Descriptions.Item>
            <Descriptions.Item label="Phim">{viewItem.movieTitle}</Descriptions.Item>
            <Descriptions.Item label="Lý do">{viewItem.reason}</Descriptions.Item>
            <Descriptions.Item label="Số tiền">{viewItem.amount.toLocaleString()}đ</Descriptions.Item>
          </Descriptions>
        )}
      </LTTModal>

      <LTTModal open={rejectModal.open} onCancel={() => setRejectModal({ open: false, id: '' })} title="Từ chối hoàn tiền" onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleReject}>
          <Form.Item name="reason" label="Lý do từ chối" rules={[{ required: true }]}><Input.TextArea /></Form.Item>
        </Form>
      </LTTModal>
    </>
  );
}
