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
          <AccordionItem
            value={`item-${index}`}
            key={index}
            className='border-b border-border'
          >
            <AccordionTrigger
              className='
                px-4
                transition-colors
                data-[state=open]:bg-muted data-[state=open]:font-semibold
                hover:bg-accent hover:text-accent-foreground
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              '
            >
              {item.question}
            </AccordionTrigger>

            <AccordionContent className='p-4 whitespace-pre-line text-sm text-muted-foreground'>
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
}
