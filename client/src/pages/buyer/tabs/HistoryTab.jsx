import React from 'react';
import { History, Receipt, CreditCard, CheckCircle2 } from 'lucide-react';

export const HistoryTab = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                    <h3 className="text-lg font-display font-bold text-stone-900">ประวัติและสลิปการจ่ายเงิน</h3>
                    <p className="text-xs text-stone-500">ตรวจสอบประวัติรายการสั่งซื้อย้อนหลังและหลักฐานการชำระเงิน</p>
                </div>
                <Receipt className="w-5 h-5 text-stone-400" />
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                <History className="w-12 h-12 text-amber-600 mx-auto" />
                <h4 className="text-sm font-bold text-stone-800">ยังไม่มีประวัติการชำระเงินย้อนหลัง</h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                    สลิปโอนเงิน ใบเสร็จรับเงิน และประวัติการสนับสนุนช่างฝีมือทั้งหมดของคุณจะถูกบันทึกไว้อย่างปลอดภัยที่นี่
                </p>
            </div>
        </div>
    );
};

export default HistoryTab;