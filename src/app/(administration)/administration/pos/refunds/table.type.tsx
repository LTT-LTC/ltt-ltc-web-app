import { ColumnsType } from 'antd/es/table';
import { Button, Tag, Space } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { RefundRequest } from './_mock/data';

const statusColor: Record<string, string> = { pending: 'orange', approved: 'green', rejected: 'red' };
const statusLabel: Record<string, string> = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Đã từ chối' };

export const getColumns = (onView: (record: RefundRequest) => void, onApprove: (id: string) => void, onReject: (id: string) => void): ColumnsType<RefundRequest> => [
  { title: 'Mã', dataIndex: 'id', key: 'id' },
  { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
  { title: 'Phim', dataIndex: 'movieTitle', key: 'movieTitle' },
  { title: 'Số tiền', dataIndex: 'amount', key: 'amount', align: 'right', render: (v) => v.toLocaleString() + 'đ' },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag> },
  { title: 'Thao tác', key: 'action', render: (_, r) => (
    <Space>
      <Button icon={<EyeOutlined />} onClick={() => onView(r)} variant="outlined" />
      {r.status === 'pending' && (
        <>
          <Button icon={<CheckCircleOutlined />} onClick={() => onApprove(r.id)} variant="outlined" style={{ color: 'green' }} />
          <Button icon={<CloseCircleOutlined />} onClick={() => onReject(r.id)} variant="outlined" danger />
        </>
      )}
    </Space>
  ) }
];
