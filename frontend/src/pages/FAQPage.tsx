import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type QA = { q: string; a: React.ReactNode };

const faqs: QA[] = [
  {
    q: "Where is the festival held?",
    a: "Striama Camping, Dryanovo, Bulgaria.",
  },
  { q: "What dates are the festival?", a: "29–30 August 2025." },
  {
    q: "Are tickets refundable?",
    a: "Tickets are non-refundable except where required by law.",
  },
  {
    q: "Is camping included?",
    a: "Camping is available; see the Tickets page for details and pricing.",
  },
];

export default function FAQPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        FAQ
      </Typography>

      {faqs.map((item, idx) => (
        <Accordion key={idx} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{item.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{item.a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
}
