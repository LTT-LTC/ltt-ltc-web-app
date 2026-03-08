import { Form, FormProps } from "antd";
import LTTForm from "../AntD/LTTForm";
import FilterItems from "./FilterItems";
import { memo, useEffect, useMemo, useRef } from "react";
import { convert } from "../../utils/convert";

export type FilterProps = {
  key: string;
  title: string;
  type: string;
  className?: string;
  options?: { label: string; value: string }[];
  rules?: any[];
  allowClear?: boolean;
  showCount?: boolean;
};

type FilterItem = {
  filterItems: FilterProps[];
  values?: any;
  defaultValues?: any;
  onChange?: (allValues: any, changedValues: any) => void;
};


const LTTFilter = ({ filterItems, values, defaultValues, onChange }: FilterItem) => {
  const [form] = Form.useForm();
  const formWatch = Form.useWatch([], form);
  const result = useMemo(() => formWatch, [formWatch]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    form.setFieldsValue(defaultValues);
  }, []);

  useEffect(() => {
    if (!values) return;
    form.setFieldsValue(values);
  }, [values]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChangeValue = (changedValues: Partial<any>, values: any) => {
    if (!onChange) return;
    onChange(convert.trimStringsInObject(values), changedValues);
  };

  const onValuesChange: FormProps["onValuesChange"] = (
    changedValues: Partial<any>,
    values: any,
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleChangeValue(changedValues, values);
    }, 300);
  };

  return (
    <>
      <LTTForm form={form} onValuesChange={onValuesChange}>
        <div className="search flex flex-row items-center gap-2">
          <FilterItems filterItems={filterItems} />
        </div>
      </LTTForm>
    </>
  );
};

export default memo(LTTFilter);
