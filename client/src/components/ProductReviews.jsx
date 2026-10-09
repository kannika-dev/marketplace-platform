import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MessageCircle, Edit2, Trash2, ChevronDown, ChevronUp, Reply } from 'lucide-react';

function ProductReviews({ productId, currentUser }) {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    // State สำหรับการซ่อน/แสดง และช่องพิมพ์ตอบกลับ
    const [openReplyId, setOpenReplyId] = useState(null);
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingReview, setEditingReview] = useState(null);

    // ดึงข้อมูลรีวิวเมื่อเปิดหน้านี้
    const fetchReviews = async () => {
        try {
            const res = await api.get(`/reviews/product/${productId}`);
            setReviews(res.data.reviews || []);
            setAverageRating(res.data.averageRating || 0);
            setTotalReviews(res.data.totalReviews || 0);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        }
    };

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    // ส่งหรือแก้ไขรีวิว
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็นครับ');
            return;
        }

        setLoading(true);
        try {
            if (editingReview) {
                await api.put(`/reviews/${editingReview.id}`, {
                    buyer_id: currentUser.id,
                    rating,
                    comment
                });
                alert('แก้ไขรีวิวเรียบร้อยแล้ว!');
                setEditingReview(null);
            } else {
                await api.post('/reviews', {
                    product_id: productId,
                    buyer_id: currentUser.id,
                    rating,
                    comment
                });
                alert('ส่งรีวิวเรียบร้อยแล้ว ขอบคุณสำหรับคำติชมครับ! ✨');
            }
            setComment('');
            setRating(5);
            fetchReviews();
        } catch (err) {
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    // ลบรีวิว
    const handleDelete = async (reviewId) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?')) return;

        try {
            await api.delete(`/reviews/${reviewId}`, {
                data: { user_id: currentUser?.id, role: currentUser?.role }
            });
            alert('ลบรีวิวเรียบร้อยแล้ว');
            fetchReviews();
        } catch (err) {
            alert('ไม่สามารถลบรีวิวได้');
        }
    };

    // เริ่มแก้ไขรีวิว
    const handleStartEdit = (rev) => {
        setEditingReview(rev);
        setRating(rev.rating);
        setComment(rev.comment);
    };

    // ร้านค้าส่งคำตอบกลับ
    const handleSendReply = async (reviewId) => {
        if (!replyText.trim()) return;
        try {
            await api.put(`/reviews/${reviewId}/reply`, { reply_text: replyText });
            alert('ตอบกลับรีวิวเรียบร้อยแล้ว!');
            setReplyText('');
            setReplyingId(null);
            setOpenReplyId(reviewId); // เปิดดูคำตอบทันทีหลังตอบเสร็จ
            fetchReviews();
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการตอบกลับ');
        }
    };

    return (
        <div className="mt-12 border-t pt-8 text-stone-800">
            <h3 className="text-2xl font-serif font-bold mb-4">รีวิวและความคิดเห็นจากผู้ซื้อ</h3>

            {/* สรุปคะแนนดาวเฉลี่ย */}
            <div className="flex items-center gap-4 bg-stone-50 p-6 rounded-2xl mb-8 border border-stone-200">
                <div className="text-center">
                    <span className="text-4xl font-extrabold text-amber-500">{averageRating}</span>
                    <span className="text-sm text-stone-500 block">จาก 5 ดาว</span>
                </div>
                <div className="border-l border-stone-300 h-10 mx-2"></div>
                <div>
                    <div className="flex text-amber-400 text-lg">
                        {'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}
                    </div>
                    <span className="text-xs text-stone-500">รวมทั้งหมด {totalReviews} รีวิว</span>
                </div>
            </div>

            {/* แบบฟอร์มให้ดาวและเขียน/แก้ไขรีวิว */}
            <form onSubmit={handleSubmit} className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/60 mb-10">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-base">
                        {editingReview ? '✏️ แก้ไขรีวิวของคุณ' : 'เขียนรีวิวสินค้าชิ้นนี้'}
                    </h4>
                    {editingReview && (
                        <button
                            type="button"
                            onClick={() => { setEditingReview(null); setComment(''); setRating(5); }}
                            className="text-xs text-stone-500 hover:underline"
                        >
                            ยกเลิกการแก้ไข
                        </button>
                    )}
                </div>

                {/* เลือกดาว */}
                <div className="flex items-center gap-1 mb-4">
                    <span className="text-sm text-stone-600 mr-2">ให้คะแนน:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className="text-2xl transition-transform hover:scale-110 focus:outline-none"
                        >
                            <span className={(hover || rating) >= star ? 'text-amber-400' : 'text-stone-300'}>
                                ★
                            </span>
                        </button>
                    ))}
                </div>

                {/* ข้อความคอมเมนต์ */}
                <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="แบ่งปันความประทับใจเกี่ยวกับสินค้างานคราฟต์ชิ้นนี้..."
                    className="w-full p-3 border rounded-xl text-sm mb-3 focus:ring-2 focus:ring-emerald-800 focus:outline-none bg-white"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm"
                >
                    {loading ? 'กำลังบันทึก...' : editingReview ? 'บันทึกการแก้ไข' : 'ส่งรีวิว'}
                </button>
            </form>

            {/* รายการรีวิวทั้งหมด */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <p className="text-stone-400 text-sm text-center py-6">ยังไม่มีรีวิวสำหรับสินค้านี้ เป็นคนแรกที่เขียนรีวิวเลย!</p>
                ) : (
                    reviews.map((rev) => {
                        const isOwner = currentUser && currentUser.id === rev.buyer_id;
                        const isAdmin = currentUser && currentUser.role === 'admin';
                        const isSeller = currentUser && (currentUser.role === 'seller' || isAdmin);

                        return (
                            <div key={rev.id} className="p-5 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-semibold text-sm block text-stone-900">{rev.reviewer_name || 'ผู้ซื้อในระบบ'}</span>
                                        <span className="text-xs text-stone-400">
                                            {new Date(rev.created_at).toLocaleDateString('th-TH')}
                                        </span>
                                    </div>

                                    {/* ปุ่มแก้ไข / ลบ */}
                                    <div className="flex items-center gap-2">
                                        {isOwner && (
                                            <button
                                                onClick={() => handleStartEdit(rev)}
                                                className="text-stone-400 hover:text-amber-600 text-xs flex items-center gap-1 p-1"
                                                title="แก้ไขรีวิว"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {(isOwner || isAdmin) && (
                                            <button
                                                onClick={() => handleDelete(rev.id)}
                                                className="text-stone-400 hover:text-rose-600 text-xs flex items-center gap-1 p-1"
                                                title="ลบรีวิว"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="text-amber-400 text-sm">
                                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                </div>

                                <p className="text-stone-700 text-sm leading-relaxed">{rev.comment}</p>

                                {/* แถบแสดงสถานะการตอบกลับ & ปุ่ม Toggle ซ่อน/ดู */}
                                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                                    {rev.reply_text ? (
                                        <button
                                            onClick={() => setOpenReplyId(openReplyId === rev.id ? null : rev.id)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            <span>ร้านค้าตอบกลับแล้ว</span>
                                            {openReplyId === rev.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                    ) : (
                                        <span className="text-xs text-stone-400 font-mono">ยังไม่มีการตอบกลับจากร้านค้า</span>
                                    )}

                                    {/* ปุ่มให้ผู้ขายกดเปิดช่องพิมพ์ตอบกลับ */}
                                    {isSeller && !rev.reply_text && (
                                        <button
                                            onClick={() => setReplyingId(replyingId === rev.id ? null : rev.id)}
                                            className="text-xs font-bold text-stone-600 hover:text-emerald-800 flex items-center gap-1"
                                        >
                                            <Reply className="w-3.5 h-3.5" />
                                            <span>ตอบกลับรีวิวนี้</span>
                                        </button>
                                    )}
                                </div>

                                {/* ส่วนแสดงคำตอบกลับ (กดเปิด/ซ่อนได้) */}
                                {openReplyId === rev.id && rev.reply_text && (
                                    <div className="mt-3 p-4 bg-stone-50 rounded-xl border-l-4 border-emerald-700 text-xs space-y-1">
                                        <div className="flex justify-between items-center font-bold text-emerald-900">
                                            <span>ร้านค้า (Artisan Master Response):</span>
                                            <span className="text-[10px] text-stone-400 font-mono font-normal">
                                                {rev.replied_at ? new Date(rev.replied_at).toLocaleDateString('th-TH') : ''}
                                            </span>
                                        </div>
                                        <p className="text-stone-600 leading-relaxed">{rev.reply_text}</p>
                                    </div>
                                )}

                                {/* ฟอร์มพิมพ์คำตอบกลับสำหรับร้านค้า */}
                                {replyingId === rev.id && (
                                    <div className="mt-3 p-3 bg-stone-50 rounded-xl border space-y-2">
                                        <textarea
                                            rows="2"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="เขียนข้อความขอบคุณ หรือชี้แจงจากร้านค้า..."
                                            className="w-full p-2 border rounded-lg text-xs bg-white focus:outline-none"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setReplyingId(null)}
                                                className="px-3 py-1 text-xs text-stone-500 hover:underline"
                                            >
                                                ยกเลิก
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSendReply(rev.id)}
                                                className="px-3 py-1 bg-emerald-800 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                                            >
                                                ส่งคำตอบกลับ
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default ProductReviews;