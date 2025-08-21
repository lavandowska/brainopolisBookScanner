"use client";

import Image from "next/image";
import { Book } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";

interface BookCardProps {
  book: Book;
  isSelected: boolean;
  onSelectionChange: (bookId: string, isSelected: boolean) => void;
  onDescriptionEnhance: (bookId: string, Description: string) => void;
}

export function BookCard({ book, isSelected, onSelectionChange, onDescriptionEnhance }: BookCardProps) {
  const { toast } = useToast();

  return (
    <Card className="flex flex-row overflow-hidden transition-all duration-300 hover:shadow-lg relative rounded-lg h-auto">
      <div className="w-full flex flex-col overflow-hidden">
        <ScrollArea className="flex-grow">
            <div className="flex flex-col h-full pr-2">
                <CardHeader className="py-2 px-1">
                <CardTitle className="text-base">{book.title} by {book.authors?.join(', ')}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-1 px-2 pt-0 space-y-1">
                  <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="text-xs py-0">Description</AccordionTrigger>
                        <AccordionContent className="pb-0">
                            <p className="text-xs text-muted-foreground">{book.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                  </Accordion>
                  
                  <div className="flex flex-wrap gap-1 text-xs">
                      Genre(s):{book.genre?.map(g => <Badge key={g} variant="secondary" className="text-xs px-1.5 py-0.0">{g}</Badge>)}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-1 py-0 px-2 mt-auto">
                  <div className="text-xs text-muted-foreground">ASIN: {book.asin}</div>
                  <div className="text-sm font-bold text-primary">${book.price?.toFixed(2)}</div>
                </CardFooter>
            </div>
        </ScrollArea>
        <div className="absolute top-2 right-2 z-10">
            <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange(book.id, !!checked)}
            aria-label={`Select book ${book.title}`}
            className="bg-white/80 backdrop-blur-sm"
            />
        </div>
      </div>
    </Card>
  );
}
