'use client';

import { Breadcrumb, BreadcrumbProps } from "antd";

type LTTBreadcrumbProps = BreadcrumbProps & {};

const LTTBreadcrumb = ({ ...props }: LTTBreadcrumbProps) => {
  return <Breadcrumb {...props} className="m-2" items={props?.items} />;
};

export default LTTBreadcrumb;
