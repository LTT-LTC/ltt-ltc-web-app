import { Col, Row, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface FilterProps { search: string; onSearch: (val: string) => void; status: string; onStatus: (val: string) => void; }

export default function RefundsFilter({ search, onSearch, status, onStatus }: FilterProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} md={12}>
        <Input prefix={<SearchOutlined />} placeholder="Tìm theo mã, khách hàng, phim..." value={search} onChange={(e) => onSearch(e.target.value)} />
      </Col>
      <Col xs={24} md={12}>
        <Select value={status} onChange={onStatus} style={{ width: '100%' }} options={[{ value: 'all', label: 'Tất cả trạng thái' }, { value: 'pending', label: 'Chờ duyệt' }]} />
      </Col>
    </Row>
  );
}
