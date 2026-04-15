'use client';
import { useState, useMemo } from 'react';
import { Form, Input, Select, Space, Typography, Descriptions, Tag, Row, Col, Card } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import LTTTable from '@/src/@core/component/AntD/LTTTable';
import LTTButton from '@/src/@core/component/AntD/LTTButton';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import LTTBreadcrumb from '@/src/@core/component/AntD/LTTBreadcrumb';
import LTTModal from '@/src/@core/component/AntD/LTTModal';
import CRMFilter from '../Filter';
import { getColumns } from '../table.type';
import { Incident, mockIncidents, mockStaff } from '../_mock/data';

export default function CRMListPage() {
  const [items, setItems] = useState<Incident[]>(mockIncidents);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [viewItem, setViewItem] = useState<Incident | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [form] = Form.useForm();

  const filtered = useMemo(() => {
    let list = items;
    if (status !== 'all') list = list.filter(i => i.status === status);
    if (type !== 'all') list = list.filter(i => i.type === type);
    if (search) list = list.filter(i => i.subject.toLowerCase().includes(search.toLowerCase()) || i.customerName.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [items, search, status, type]);

  const handleCreate = (values: any) => {
    const newItem: Incident = { id: 'INC-' + Date.now(), ...values, cinemaId: 'all', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setItems([...items, newItem]);
    setCreateModal(false);
    form.resetFields();
  };

  return (
    <>
      <LTTBreadcrumb items={[{ title: 'CRM & Sự cố' }]} />
      <LTTCard title="CRM & Sự cố" extra={<LTTButton variant="primary" icon={<PlusOutlined />} onClick={() => setCreateModal(true)}>Tạo sự cố</LTTButton>} className="mt-4">
        <Row gutter={[16, 16]} className="mb-6">
          {['open', 'in_progress', 'resolved', 'closed'].map(s => (
            <Col span={6} key={s}>
              <Card size="small" style={{ cursor: 'pointer' }} onClick={() => setStatus(status === s ? 'all' : s)}>
                <Typography.Text type="secondary">{s}</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>{items.filter(i => i.status === s).length}</Typography.Title>
              </Card>
            </Col>
          ))}
        </Row>
        <CRMFilter search={search} onSearch={setSearch} status={status} onStatus={setStatus} type={type} onType={setType} />
        <LTTTable rowKey="id" columns={getColumns(setViewItem)} dataSource={filtered} />
      </LTTCard>

      <LTTModal open={!!viewItem} onCancel={() => setViewItem(null)} title="Chi tiết sự cố" footer={null}>
        {viewItem && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Khách hàng">{viewItem.customerName}</Descriptions.Item>
            <Descriptions.Item label="Tiêu đề">{viewItem.subject}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{viewItem.description}</Descriptions.Item>
          </Descriptions>
        )}
      </LTTModal>

      <LTTModal open={createModal} onCancel={() => setCreateModal(false)} title="Tạo sự cố" onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="customerName" label="Khách hàng" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="subject" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="Loại" initialValue="complaint"><Select options={[{value:'complaint', label:'Khiếu nại'}]} /></Form.Item>
          <Form.Item name="priority" label="Ưu tiên" initialValue="medium"><Select options={[{value:'medium', label:'Medium'}]} /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea /></Form.Item>
        </Form>
      </LTTModal>
    </>
  );
}
