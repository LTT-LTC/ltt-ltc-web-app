"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import AdminTablePagination from "../../_components/AdminTablePagination";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { memberCardRequestService } from "@/src/services/administration-service/member-card-request/member-card-request.service";
import { MemberCardRequestOutputDto } from "@/src/services/administration-service/member-card-request/models/output.model";

export default function MemberCardRequestListPage() {
    const [items, setItems] = useState<MemberCardRequestOutputDto[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const listMutation = useLTTMutation<PagedResultDto<MemberCardRequestOutputDto>, { skipCount: number; maxResultCount: number }>({
        mutationFn: (params) => memberCardRequestService.getListAsync(params),
        onSuccess: (res) => {
            setItems(res?.items || []);
            setTotalCount(res?.totalCount || 0);
        },
        onError: (err) => toast.error(err.message || "Failed to fetch member card requests."),
    });

    const approveMutation = useLTTMutation<MemberCardRequestOutputDto, string>({
        mutationFn: (id) => memberCardRequestService.approveAsync(id, {}),
        onSuccess: () => {
            toast.success("Request approved.");
            fetchData();
        },
        onError: (err) => toast.error(err.message || "Failed to approve request."),
    });

    const rejectMutation = useLTTMutation<MemberCardRequestOutputDto, string>({
        mutationFn: (id) => memberCardRequestService.rejectAsync(id, {}),
        onSuccess: () => {
            toast.success("Request rejected.");
            fetchData();
        },
        onError: (err) => toast.error(err.message || "Failed to reject request."),
    });

    const fetchData = () => {
        listMutation.mutation({
            skipCount: (page - 1) * pageSize,
            maxResultCount: pageSize,
        });
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">MemberCard Request</h1>
                <LTTButton variant="outline" className="gap-2" onClick={fetchData} loading={listMutation.isLoading}>
                    <RefreshCw className="h-4 w-4" /> Refresh
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                        <th className="px-4 py-3 text-left font-semibold">Type</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-left font-semibold">CustomerId</th>
                        <th className="px-4 py-3 text-left font-semibold">Requested At</th>
                        <th className="px-4 py-3 text-right font-semibold">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-12 text-center text-muted-foreground-shadcn">
                                {listMutation.isLoading ? "Loading..." : "No request found."}
                            </td>
                        </tr>
                    ) : (
                        items.map((item) => (
                            <tr key={item.id} className="border-b border-border-shadcn">
                                <td className="px-4 py-3">{item.requestType}</td>
                                <td className="px-4 py-3">{item.requestStatus}</td>
                                <td className="px-4 py-3">{item.customerId}</td>
                                <td className="px-4 py-3">{new Date(item.requestedAt).toLocaleString()}</td>
                                <td className="px-4 py-3 text-right">
                                    {item.requestStatus === "PENDING" ? (
                                        <div className="flex justify-end gap-2">
                                            <LTTButton variant="outline" onClick={() => rejectMutation.mutation(item.id)} loading={rejectMutation.isLoading}>
                                                Reject
                                            </LTTButton>
                                            <LTTButton onClick={() => approveMutation.mutation(item.id)} loading={approveMutation.isLoading}>
                                                Approve
                                            </LTTButton>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground-shadcn">Reviewed</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <AdminTablePagination
                totalCount={totalCount}
                page={page}
                pageSize={pageSize}
                loading={listMutation.isLoading}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPage(1);
                    setPageSize(size);
                }}
            />
        </div>
    );
}
