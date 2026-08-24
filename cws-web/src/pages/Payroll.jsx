import { useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, Trash2 } from "lucide-react";

import { api } from "@/lib/api";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import { inr, cn } from "@/lib/utils";

export default function Payroll() {
    const [month, setMonth] = useState(
        new Date().toISOString().slice(0, 7)
    );

    const [editingId, setEditingId] = useState(null);

    const [editData, setEditData] = useState({
        additions: 0,
        deductions: 0,
    });

    const [delRec, setDelRec] = useState(null);

    const qc = useQueryClient();

    const {
        data: payrolls = [],
        isLoading,
    } = useQuery({
        queryKey: ["payroll", month],
        queryFn: () => api.get(`/api/payroll?month=${month}`),
    });

    const totalBase = payrolls.reduce(
        (sum, p) => sum + Number(p.baseAmount || 0),
        0
    );

    const totalAdd = payrolls.reduce(
        (sum, p) => sum + Number(p.additions || 0),
        0
    );

    const totalDed = payrolls.reduce(
        (sum, p) => sum + Number(p.deductions || 0),
        0
    );

    const totalNet = payrolls.reduce(
        (sum, p) => sum + Number(p.netPay || 0),
        0
    );

    const paidCount = payrolls.filter(
        (p) => p.status === "PAID"
    ).length;

    const startEdit = (p) => {
        setEditingId(p.id);

        setEditData({
            additions: Number(p.additions || 0),
            deductions: Number(p.deductions || 0),
        });
    };

    const cancelEdit = () => {
        setEditingId(null);

        setEditData({
            additions: 0,
            deductions: 0,
        });
    };

    const saveEdit = async (id) => {
        try {
            await api.patch(`/api/payroll/${id}`, {
                additions: Number(editData.additions || 0),
                deductions: Number(editData.deductions || 0),
            });

            toast.success("Payroll updated ✏️");

            cancelEdit();

            qc.invalidateQueries({
                queryKey: ["payroll"],
            });
        } catch (e) {
            toast.error(
                e?.response?.data?.error || "Update failed ❌"
            );
        }
    };

    const markPaid = async (id) => {
        try {
            await api.patch(`/api/payroll/${id}`, {
                status: "PAID",
            });

            toast.success("Marked as Paid! 💸");

            qc.invalidateQueries({
                queryKey: ["payroll"],
            });
        } catch (e) {
            toast.error(
                e?.response?.data?.error ||
                "Failed to mark paid ❌"
            );
        }
    };

    const handleDelete = async () => {
        if (!delRec) return;

        try {
            await api.delete(`/api/payroll/${delRec.id}`);

            toast.success("Payroll record deleted 🗑");

            setDelRec(null);

            qc.invalidateQueries({
                queryKey: ["payroll"],
            });
        } catch (e) {
            toast.error(
                e?.response?.data?.error ||
                "Delete failed ❌"
            );
        }
    };

    return (
        <div className="space-y-4">
            {/* HEADER */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-2xl font-extrabold">
                    💵 Payroll Management
                </h1>

                <Input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-44"
                />
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-4">
                    <p className="text-[10px] font-bold text-mut uppercase">
                        Total Base
                    </p>

                    <p className="text-xl font-extrabold mt-1">
                        {inr(totalBase)}
                    </p>
                </Card>

                <Card className="p-4">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">
                        + Additions
                    </p>

                    <p className="text-xl font-extrabold mt-1 text-emerald-400">
                        {inr(totalAdd)}
                    </p>
                </Card>

                <Card className="p-4">
                    <p className="text-[10px] font-bold text-rose-400 uppercase">
                        - Deductions
                    </p>

                    <p className="text-xl font-extrabold mt-1 text-rose-400">
                        {inr(totalDed)}
                    </p>
                </Card>

                <Card className="p-4 bg-primary/10 border-primary/30">
                    <p className="text-[10px] font-bold text-primary uppercase">
                        Net Payable
                    </p>

                    <p className="text-xl font-extrabold mt-1 text-primary">
                        {inr(totalNet)}
                    </p>

                    <p className="text-[10px] text-mut mt-1">
                        {paidCount}/{payrolls.length} Paid
                    </p>
                </Card>
            </div>

            {/* PAYROLL TABLE */}
            <Card className="p-4 overflow-x-auto">
                {isLoading ? (
                    <div className="text-center py-10 text-mut">
                        Loading payroll...
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-mut text-xs border-b border-line">
                                <th className="py-2">Staff</th>
                                <th>Type</th>
                                <th className="text-right">Base Salary</th>
                                <th className="text-right">Add (+)</th>
                                <th className="text-right">Deduct (-)</th>
                                <th className="text-right">Net Pay</th>
                                <th className="text-center">Status</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {payrolls.map((p) => {
                                const isEditing = editingId === p.id;

                                const baseAmount = Number(
                                    p.baseAmount || 0
                                );

                                const addVal = isEditing
                                    ? Number(editData.additions || 0)
                                    : Number(p.additions || 0);

                                const dedVal = isEditing
                                    ? Number(editData.deductions || 0)
                                    : Number(p.deductions || 0);

                                const netVal =
                                    baseAmount + addVal - dedVal;

                                return (
                                    <tr
                                        key={p.id}
                                        className="border-b border-line/50 hover:bg-bg/50"
                                    >
                                        {/* STAFF */}
                                        <td className="py-3 font-bold">
                                            {p.staff?.name || "Unknown Staff"}
                                        </td>

                                        {/* TYPE */}
                                        <td>
                                            <span
                                                className={cn(
                                                    "text-[10px] font-bold rounded-full px-2 py-0.5",
                                                    p.staff?.payrollType === "FIXED"
                                                        ? "bg-sky-500/15 text-sky-400"
                                                        : "bg-amber-500/15 text-amber-400"
                                                )}
                                            >
                                                {p.staff?.payrollType === "FIXED"
                                                    ? "FIXED"
                                                    : "ATTEND"}
                                            </span>
                                        </td>

                                        {/* BASE */}
                                        <td className="text-right font-extrabold">
                                            {inr(baseAmount)}
                                        </td>

                                        {/* ADDITIONS */}
                                        <td className="text-right">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={editData.additions}
                                                    onChange={(e) =>
                                                        setEditData((prev) => ({
                                                            ...prev,
                                                            additions:
                                                                Number(e.target.value) || 0,
                                                        }))
                                                    }
                                                    className="w-24 rounded bg-bg border border-line px-2 py-1 text-right text-xs"
                                                />
                                            ) : (
                                                <span className="text-emerald-400 font-bold">
                                                    {addVal > 0
                                                        ? inr(addVal)
                                                        : "—"}
                                                </span>
                                            )}
                                        </td>

                                        {/* DEDUCTIONS */}
                                        <td className="text-right">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={editData.deductions}
                                                    onChange={(e) =>
                                                        setEditData((prev) => ({
                                                            ...prev,
                                                            deductions:
                                                                Number(e.target.value) || 0,
                                                        }))
                                                    }
                                                    className="w-24 rounded bg-bg border border-line px-2 py-1 text-right text-xs"
                                                />
                                            ) : (
                                                <span className="text-rose-400 font-bold">
                                                    {dedVal > 0
                                                        ? inr(dedVal)
                                                        : "—"}
                                                </span>
                                            )}
                                        </td>

                                        {/* NET */}
                                        <td className="text-right font-extrabold text-primary">
                                            {inr(netVal)}
                                        </td>

                                        {/* STATUS */}
                                        <td className="text-center">
                                            {p.status === "PAID" ? (
                                                <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 rounded-full px-2 py-0.5">
                                                    PAID ✅
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 rounded-full px-2 py-0.5">
                                                    DRAFT
                                                </span>
                                            )}
                                        </td>

                                        {/* ACTION */}
                                        <td className="text-right">
                                            {isEditing ? (
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="soft"
                                                        onClick={cancelEdit}
                                                    >
                                                        Cancel
                                                    </Button>

                                                    <Button
                                                        onClick={() =>
                                                            saveEdit(p.id)
                                                        }
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end items-center gap-2">
                                                    <button
                                                        onClick={() => startEdit(p)}
                                                        disabled={p.status === "PAID"}
                                                        className={cn(
                                                            "text-xs font-bold hover:underline",
                                                            p.status === "PAID"
                                                                ? "text-mut cursor-not-allowed"
                                                                : "text-primary"
                                                        )}
                                                    >
                                                        Edit
                                                    </button>

                                                    {p.status !== "PAID" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    markPaid(p.id)
                                                                }
                                                                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                                                            >
                                                                <CheckCircle size={12} />
                                                                Mark Paid
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    setDelRec(p)
                                                                }
                                                                className="text-rose-500 hover:text-rose-400"
                                                                title="Delete Record"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {payrolls.length === 0 && !isLoading && (
                    <p className="text-center py-10 text-mut">
                        No active staff found for this month.
                    </p>
                )}
            </Card>

            {/* DELETE CONFIRM DIALOG */}
            <ConfirmDialog
                open={!!delRec}
                onClose={() => setDelRec(null)}
                onConfirm={handleDelete}
                title="Delete Payroll Record?"
                message={
                    delRec
                        ? `Are you sure you want to delete ${delRec.staff?.name}'s payroll for ${delRec.month}? This cannot be undone.`
                        : ""
                }
                confirmText="Delete"
            />
        </div>
    );
}