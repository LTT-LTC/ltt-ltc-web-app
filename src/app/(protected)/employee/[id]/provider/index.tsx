import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { administrationService } from "@/src/services/administration-service/administration.service";
import { EmployeeOutputDto } from "@/src/services/administration-service/employee/models/output.model";
import { useParams } from "next/navigation";
import { createContext, useContext, useEffect } from "react";
import employee from "@/src/stores/administration-service/employee";

type EmployeeDetailsContextType = {
  employeeDetail: {
    employeeId: string;
    employee: EmployeeOutputDto | null;
    isEmployeeDetailLoading: boolean;
    isEmployeeDetailInitLoading: boolean;
  };
  createEmployee?: {
    action: (input: { body: FormData }) => void;
    isCreateEmployeeLoading: boolean;
    isCreateEmployeeInitLoading: boolean;
  }
  updateEmployee?: {
    action: (input: { employeeId: string; body: FormData }) => void;
    isUpdateEmployeeLoading: boolean;
    isUpdateEmployeeInitLoading: boolean;
  }
};

const EmployeeDetailsContext = createContext<
  EmployeeDetailsContextType | undefined
>(undefined);

export const useEmployeeDetails = () => {
  const context = useContext(EmployeeDetailsContext);
  if (!context) {
    throw new Error(
      "useEmployeeDetails must be used within a EmployeeDetailsProvider",
    );
  }
  return context;
};

export const EmployeeDetailsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { id } = useParams<{ id: string }>();
  // ----------------------------- << Chi tiết>> -----------------------------
  const {
    mutation: getEmployeeDetail,
    data: employeeDetail,
    isLoading: isEmployeeDetailLoading,
    isInitLoading: isEmployeeDetailInitLoading,
  } = useLTTMutation<EmployeeOutputDto, string>({
    mutationFn: (employeeId) => {
      return administrationService.employeeService.getEmployeeByIdAsync(
        employeeId,
      );
    },
  });

  // ------------------------------ << Tạo mới >> -------------------------------

  const {
    mutation: createEmployeeAction,
    data: createEmployee,
    isLoading: isCreateEmployeeLoading,
    isInitLoading: isCreateEmployeeInitLoading,
  } = useLTTMutation<string, { body: any }>({
    mutationFn: ({ body }) => {
      return administrationService.employeeService.createEmployeeAsync(body);
    },
  });

  useEffect(() => {
    if (id) getEmployeeDetail(id);
  }, [id]);

  // ------------------------------ << Cập nhật >> ------------------------------
  const {
    mutation: updateEmployeeAction,
    data: updatedEmployee,
    isLoading: isUpdateEmployeeLoading,
    isInitLoading: isUpdateEmployeeInitLoading,
  } = useLTTMutation<boolean, { employeeId: string; body: any }>({
    mutationFn: ({ employeeId, body }) => {
      return administrationService.employeeService.updateEmployeeAsync(
        employeeId,
        body,
      );
    },
  });

  return (
    <EmployeeDetailsContext.Provider
      value={{
        employeeDetail: {
          employeeId: id,
          employee: employeeDetail,
          isEmployeeDetailLoading,
          isEmployeeDetailInitLoading,
        },
        createEmployee: {
          action: createEmployeeAction,
          isCreateEmployeeLoading,
          isCreateEmployeeInitLoading,
        },
        updateEmployee: {
          action: updateEmployeeAction,
          isUpdateEmployeeLoading,
          isUpdateEmployeeInitLoading,
        },
      }}
    >
      {children}
    </EmployeeDetailsContext.Provider>
  );
};
