"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Container from "../common/Container";

interface Props {
  items: {
    question: string;
    answer: string;
  }[];
}

export default function FaqAccordion({ items }: Props) {
  return (
    <Container>
      <Accordion type='multiple' className='w-full'>
        {items.map((item, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className='data-[state=open]:bg-gray-100 data-[state=open]:font-bold transition-colors px-4'>
              {item.question}
            </AccordionTrigger>
            <AccordionContent className='whitespace-pre-line text-sm text-gray600 p-4'>
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
}
