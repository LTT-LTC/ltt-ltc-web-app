import { Col, Row, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface FilterProps { search: string; onSearch: (val: string) => void; status: string; onStatus: (val: string) => void; type: string; onType: (val: string) => void; }

export default function CRMFilter({ search, onSearch, status, onStatus, type, onType }: FilterProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} md={8}>
        <Input prefix={<SearchOutlined />} placeholder="Tìm theo ID, tiêu đề, khách..." value={search} onChange={(e) => onSearch(e.target.value)} />
      </Col>
      <Col xs={12} md={8}>
        <Select value={status} onChange={onStatus} style={{ width: '100%' }} options={[{ value: 'all', label: 'Tất cả trạng thái' }, { value: 'open', label: 'Mới' }]} />
      </Col>
      <Col xs={12} md={8}>
        <Select value={type} onChange={onType} style={{ width: '100%' }} options={[{ value: 'all', label: 'Tất cả loại' }, { value: 'complaint', label: 'Khiếu nại' }]} />
      </Col>
    </Row>
  );
}
