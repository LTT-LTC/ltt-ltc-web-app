import { ColumnsType } from 'antd/es/table';
import { Button, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { Incident } from './_mock/data';

const typeLabel: Record<string, string> = { complaint: 'Khiếu nại', feedback: 'Góp ý', inquiry: 'Hỏi đáp', technical: 'Kỹ thuật', refund_request: 'Yêu cầu hoàn tiền' };
const typeColor: Record<string, string> = { complaint: 'red', feedback: 'green', inquiry: 'blue', technical: 'orange', refund_request: 'purple' };
const priorityColor: Record<string, string> = { low: 'default', medium: 'blue', high: 'orange', urgent: 'red' };
const statusColor: Record<string, string> = { open: 'red', in_progress: 'orange', resolved: 'green', closed: 'default' };
const statusLabel: Record<string, string> = { open: 'Mới', in_progress: 'Đang xử lý', resolved: 'Đã giải quyết', closed: 'Đã đóng' };

export const getColumns = (onView: (record: Incident) => void): ColumnsType<Incident> => [
  { title: 'Mã', dataIndex: 'id', key: 'id' },
  { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
  { title: 'Tiêu đề', dataIndex: 'subject', key: 'subject' },
  { title: 'Loại', dataIndex: 'type', key: 'type', render: (t) => <Tag color={typeColor[t]}>{typeLabel[t]}</Tag> },
  { title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', render: (p) => <Tag color={priorityColor[p]}>{p}</Tag> },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag> },
  { title: 'Phụ trách', dataIndex: 'assignedTo', key: 'assignedTo' },
  { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt' },
  { title: 'Thao tác', key: 'action', render: (_, r) => <Button icon={<EyeOutlined />} onClick={() => onView(r)} variant="outlined" /> }
];
