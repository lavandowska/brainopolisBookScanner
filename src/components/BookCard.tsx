"use client";

import Image from "next/image";
import { Book } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';

interface BookCardProps {
  book: Book;
  isSelected: boolean;
  onSelectionChange: (bookId: string, isSelected: boolean) => void;
  onDescriptionEnhance: (bookId: string, Description: string) => void;
}

export function BookCard({ book, isSelected, onSelectionChange, onDescriptionEnhance }: BookCardProps) {
  const { toast } = useToast();

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden transition-all duration-300 hover:shadow-lg relative rounded-lg">
      <div className="absolute top-4 right-4 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectionChange(book.id, !!checked)}
          aria-label={`Select book ${book.title}`}
          className="bg-white/80 backdrop-blur-sm"
        />
      </div>
      <div className="relative md:w-1/3">
         <Image
          src={book.imageUrl}
          alt={`Book cover for ${book.title}`}
          width={100}
          height={150}
          className="object-cover w-full h-full"
          data-ai-hint={book.imageHint}
        />
      </div>
      <div className="w-full md:w-2/3 flex flex-col">
        <CardHeader>
          <CardTitle>{book.title}</CardTitle>
          <CardDescription>by {book.authors?.join(', ')}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent className="space-y-2">
                <p className="text-muted-foreground">{book.description}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="flex flex-wrap gap-2">
            {book.genre?.map(g => <Badge key={g} variant="secondary">{g}</Badge>)}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">ASIN: {book.asin}</div>
          <div className="text-lg font-bold text-primary">${book.price?.toFixed(2)}</div>
        </CardFooter>
      </div>
    </Card>
  );
}
