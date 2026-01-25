'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Switch } from "@/app/components/ui/switch";
import { updateHomeBoardStatus } from '@/app/actions/home';
import { toast } from 'sonner';

export default function HomeBoardSelector({ initialBoards }: { initialBoards: any[] }) {
    const [boards, setBoards] = useState(initialBoards);

    const handleToggle = async (category: string, currentStatus: boolean) => {
        const activeCount = boards.filter(b => b.showOnHome).length;

        if (!currentStatus && activeCount >= 3) {
            toast.error("메인 화면에는 최대 3개의 게시판만 노출할 수 있습니다.");
            return;
        }

        const success = await updateHomeBoardStatus(category, !currentStatus);
        if (success) {
            setBoards(boards.map(b => b.category === category ? { ...b, showOnHome: !currentStatus } : b));
            toast.success("설정이 저장되었습니다.");
        } else {
            toast.error("저장에 실패했습니다.");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>메인 화면 게시판 설정 (최대 3개)</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>게시판 이름</TableHead>
                            <TableHead>카테고리</TableHead>
                            <TableHead className="text-right">메인 노출</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {boards.map((board) => (
                            <TableRow key={board.category}>
                                <TableCell className="font-medium">{board.name}</TableCell>
                                <TableCell>{board.category}</TableCell>
                                <TableCell className="text-right">
                                    <Switch
                                        checked={board.showOnHome}
                                        onCheckedChange={() => handleToggle(board.category, board.showOnHome)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
