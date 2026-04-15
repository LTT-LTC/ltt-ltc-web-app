import { ColumnsType } from 'antd/es/table';
import { Button, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { SeatType } from './_mock/data';

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
        <Popconfirm title="Bạn có chắc là muốn xoá?" onConfirm={() => onDelete(record.id)}>
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  },
];
