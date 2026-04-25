import { ColumnsType } from 'antd/es/table';
import { Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { SeatType } from './_mock/data';
import LTTConfirmDialog from '@/src/@core/component/LTTConfirmDialog';

export const columns = (onEdit: (record: SeatType) => void, onDelete: (id: number) => void): ColumnsType<SeatType> => [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: 'Tên loại ghế', dataIndex: 'name', key: 'name' },
  { title: 'Mô tả', dataIndex: 'description', key: 'description' },
  { title: 'Hệ số giá', dataIndex: 'priceMultiplier', key: 'priceMultiplier', width: 120 },
  { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  { title: 'Ngày cập nhật', dataIndex: 'updatedAt', key: 'updatedAt', width: 160 },
  {
    title: 'Hành động',
    key: 'action',
    width: 120,
    render: (_, record) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
        <LTTConfirmDialog
          title="Xác nhận xóa"
          description="Bạn có chắc chắn muốn xóa loại ghế này?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={() => onDelete(record.id)}
          trigger={<Button danger icon={<DeleteOutlined />} />}
        />
      </Space>
    ),
  },
];
