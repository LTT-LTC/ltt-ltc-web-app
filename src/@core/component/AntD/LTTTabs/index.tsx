import { Tabs, TabsProps } from "antd";
import LTTBadge, { BadgeColor, BadgeSize, BadgeVariant } from "../../LTTBadge";
import LTTRenderIf from "../../LTTRenderIf";

type LTTTabsProps = Omit<TabsProps, "items"> & {
  items: LTTTabItemsProps;
};

export type LTTPrefixProps = {
  value: number;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  icon?: React.ReactNode;
};

type AntTabItemType = NonNullable<TabsProps["items"]>[number];

export type LTTTabItemsProps = Array<
  AntTabItemType & {
    prefix?: LTTPrefixProps;
    suffix?: LTTPrefixProps;
    permission?: boolean;
  }
>;

const LTTTabs = ({ ...props }: LTTTabsProps) => {
  const filteredItems = props.items?.filter((item) => {
    if (item.permission === undefined) return true;
    return item.permission === true;
  });

  const renderItems = (): TabsProps["items"] => {
    return filteredItems.map((item, index) => ({
      ...item,
      label: (
        <span
          key={index}
          className="inline-flex items-center gap-2 flex-nowrap"
        >
          <LTTRenderIf condition={!!item.prefix?.value || item.prefix?.value === 0}>
            <LTTBadge
              variant={item.prefix?.variant ?? "light"}
              color={item.prefix?.color ?? "primary"}
              size={item.prefix?.size ?? "sm"}
            >
              {item.prefix?.value}
            </LTTBadge>
          </LTTRenderIf>
          <LTTRenderIf condition={!!item.prefix?.icon}>
            {item.prefix?.icon}
          </LTTRenderIf>
          <span className="truncate">{item.label}</span>
          <LTTRenderIf condition={!!item.suffix?.value || item.suffix?.value === 0}>
            <LTTBadge
              variant={item.suffix?.variant ?? "light"}
              color={item.suffix?.color ?? "primary"}
              size={item.suffix?.size ?? "sm"}
            >
              {item.suffix?.value}
            </LTTBadge>
          </LTTRenderIf>
          <LTTRenderIf condition={!!item.suffix?.icon}>
            {item.suffix?.icon}
          </LTTRenderIf>
        </span>
      ),
    }));
  };

  return (
    <Tabs
      defaultActiveKey={props?.defaultActiveKey}
      activeKey={props?.activeKey}
      items={renderItems()}
      onChange={props?.onChange}
    />
  );
};

export default LTTTabs;
