'use client';
import { Table, TableProps } from "antd";
import LTTPagination from "../LTTPagination";
import LTTRenderIf from "../../LTTRenderIf";
import LTTEmpty from "../LTTEmpty";

type LTTTableProps = TableProps<any> & {
  columns: any[];
  dataSource: any[];
  pagination?: LTTPaginationProps;
};

type LTTPaginationProps = {
  totalCount: number;
  page: number;
  fetch: number;
  onChange: (page: number, fetch: number) => void;
};

const LTTTable = ({
  columns,
  dataSource,
  pagination,
  ...props
}: LTTTableProps) => {
  return (
    <>
      <Table
        rowKey={props?.rowKey ?? "id"}
        {...props}
        scroll={{ x: "max-content", ...(props?.scroll || {}) }}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        locale={{
          emptyText: <LTTRenderIf condition={(dataSource ?? [])?.length === 0}><LTTEmpty /></LTTRenderIf>,
        }}
      />
      <LTTRenderIf condition={pagination != null && pagination != undefined}>
        <LTTPagination
          className="m-2 flex justify-end rounded-xl"
          total={pagination?.totalCount}
          current={pagination?.page}
          pageSize={pagination?.fetch}
          onChange={pagination?.onChange}
        />
      </LTTRenderIf>
    </>
  );
};

export default LTTTable;
