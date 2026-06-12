'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSetStock from '@/app/libs/setStock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { EngineerStockQuery } from '@/app/libs/getEngineerStock';

interface EngineerOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface PartOption {
  id: string;
  name: string;
  sku: string;
}

interface Props {
  stock: EngineerStockQuery['engineerStock'];
  engineers: EngineerOption[];
  parts: PartOption[];
}

function StockRow({
  row,
}: {
  row: EngineerStockQuery['engineerStock'][number];
}): React.JSX.Element {
  const router = useRouter();
  const [quantity, setQuantity] = useState<number>(row.quantity);
  const [minQuantity, setMinQuantity] = useState<number>(row.minQuantity);
  const [setStock, { loading: isSaving }] = useSetStock();

  async function handleSave(): Promise<void> {
    await setStock({
      variables: {
        data: {
          engineerId: row.engineer.id,
          partId: row.part.id,
          quantity,
          minQuantity,
        },
      },
    });
    router.refresh();
  }

  return (
    <TableRow className={row.isLowStock ? 'bg-destructive/10' : undefined}>
      <TableCell>
        {row.engineer.firstName} {row.engineer.lastName}
      </TableCell>
      <TableCell>
        {row.part.name} ({row.part.sku})
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={minQuantity}
          onChange={(e) => setMinQuantity(Number(e.target.value))}
          className="w-20"
        />
      </TableCell>
      <TableCell>{row.isLowStock ? 'Low' : 'OK'}</TableCell>
      <TableCell>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </TableCell>
    </TableRow>
  );
}

function NewStockRow({
  engineers,
  parts,
}: {
  engineers: EngineerOption[];
  parts: PartOption[];
}): React.JSX.Element {
  const router = useRouter();
  const [engineerId, setEngineerId] = useState<string>('');
  const [partId, setPartId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [minQuantity, setMinQuantity] = useState<number>(0);
  const [setStock, { loading: isAdding }] = useSetStock();

  async function handleAdd(): Promise<void> {
    if (!engineerId || !partId) return;
    await setStock({
      variables: { data: { engineerId, partId, quantity, minQuantity } },
    });
    setEngineerId('');
    setPartId('');
    setQuantity(0);
    setMinQuantity(0);
    router.refresh();
  }

  return (
    <TableRow>
      <TableCell>
        <Select value={engineerId} onValueChange={setEngineerId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Engineer" />
          </SelectTrigger>
          <SelectContent>
            {engineers.map((engineer) => (
              <SelectItem key={engineer.id} value={engineer.id}>
                {engineer.firstName} {engineer.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select value={partId} onValueChange={setPartId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Part" />
          </SelectTrigger>
          <SelectContent>
            {parts.map((part) => (
              <SelectItem key={part.id} value={part.id}>
                {part.name} ({part.sku})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={minQuantity}
          onChange={(e) => setMinQuantity(Number(e.target.value))}
          className="w-20"
        />
      </TableCell>
      <TableCell />
      <TableCell>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={isAdding || !engineerId || !partId}
        >
          {isAdding ? 'Adding…' : 'Add'}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function StockTable({
  stock,
  engineers,
  parts,
}: Props): React.JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Engineer</TableHead>
          <TableHead>Part</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Min quantity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stock.map((row) => (
          <StockRow key={row.id} row={row} />
        ))}
        <NewStockRow engineers={engineers} parts={parts} />
      </TableBody>
    </Table>
  );
}
