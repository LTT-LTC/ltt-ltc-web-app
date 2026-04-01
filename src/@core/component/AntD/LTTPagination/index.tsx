'use client';
import { Pagination, PaginationProps } from "antd";

type LTTPaginationProps = PaginationProps & {
};

const LTTPagination = (props: LTTPaginationProps) => {
  return (
    <Pagination
      {...props}
      showSizeChanger
      defaultCurrent={1}
      total={props?.total || 0}
      pageSizeOptions={[10, 20, 50, 100]}
      showTotal={
        (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total}`
      }
    />
  );
};

export default LTTPagination;

