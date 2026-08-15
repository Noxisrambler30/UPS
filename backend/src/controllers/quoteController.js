const prisma = require('../lib/prisma');
const generateUniqueCode = require('../lib/generateUniqueCode');

async function createQuote(req, res) {
  try {
    const customerId = req.user.userId;
    const { name, phone, power, backup, phase } = req.body; // no email here anymore

    if (!name || !phone || !power || !backup || !phase) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const uniqueCode = generateUniqueCode();

    const [, newRequest] = await prisma.$transaction([
      prisma.user.update({
        where: { id: customerId },
        data: { name, phone }, // email intentionally excluded
      }),
      prisma.request.create({
        data: { uniqueCode, power, backup, phase, customerId },
      }),
    ]);

    res.status(201).json(newRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong creating the request' });
  }
}

async function getQuoteByCode(req, res) {
  try {
    const { uniqueCode } = req.params;

    const request = await prisma.request.findUnique({
      where: { uniqueCode },
      include: {
        quote: { include: { lineItems: true } },
        bill: true,
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'No request found with that code' });
    }

    res.status(200).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching the request' });
  }
}

async function getAllQuotes(req, res) {
  try {
    const { status } = req.query;

    const requests = await prisma.request.findMany({
      where: status ? { status } : {},
      include: {
        customer: true,
        quote: { include: { lineItems: true } },
        bill: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching requests' });
  }
}

async function updateQuoteStatus(req, res) {
  try {
    const { uniqueCode } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'QUOTED', 'REVISION_REQUESTED', 'APPROVED', 'BILLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const existingRequest = await prisma.request.findUnique({ where: { uniqueCode } });
    if (!existingRequest) {
      return res.status(404).json({ error: 'No request found with that code' });
    }

    if (status === 'QUOTED') {
      const { lineItems, pdfUrl, pdfPublicId } = req.body;

      if (!Array.isArray(lineItems) || lineItems.length === 0 || !pdfUrl || !pdfPublicId) {
        return res.status(400).json({ error: 'lineItems (non-empty array), pdfUrl, and pdfPublicId are required' });
      }

      const calculatedItems = lineItems.map((item) => {
        const { description, qty, unitPrice, gstRate = 18 } = item;
        const lineTotal = qty * unitPrice;
        const halfRate = gstRate / 2;
        const sgstAmount = lineTotal * (halfRate / 100);
        const cgstAmount = lineTotal * (halfRate / 100);
        const grandTotal = lineTotal + sgstAmount + cgstAmount;
        return { description, qty, unitPrice, gstRate, sgstAmount, cgstAmount, lineTotal, grandTotal };
      });

      const quoteAmount = calculatedItems.reduce((sum, item) => sum + item.grandTotal, 0);

      // If a Quote already exists (this is a revision resend), remove old line items first
      const existingQuote = await prisma.quote.findUnique({ where: { requestId: existingRequest.id } });

      let updatedRequest, resultQuote;

      if (existingQuote) {
        await prisma.quoteLineItem.deleteMany({ where: { quoteId: existingQuote.id } });

        [updatedRequest, resultQuote] = await prisma.$transaction([
          prisma.request.update({ where: { uniqueCode }, data: { status: 'QUOTED' } }),
          prisma.quote.update({
            where: { id: existingQuote.id },
            data: {
              amount: quoteAmount,
              pdfUrl,
              pdfPublicId,
              lineItems: { create: calculatedItems },
            },
          }),
        ]);
      } else {
        [updatedRequest, resultQuote] = await prisma.$transaction([
          prisma.request.update({ where: { uniqueCode }, data: { status: 'QUOTED' } }),
          prisma.quote.create({
            data: {
              requestId: existingRequest.id,
              amount: quoteAmount,
              pdfUrl,
              pdfPublicId,
              lineItems: { create: calculatedItems },
            },
          }),
        ]);
      }

      return res.status(200).json({ ...updatedRequest, quote: resultQuote });
    }

    if (status === 'BILLED') {
      const quote = await prisma.quote.findUnique({ where: { requestId: existingRequest.id } });

      if (!quote) {
        return res.status(400).json({ error: 'Cannot bill a request that has no quote yet' });
      }

      const [updatedRequest] = await prisma.$transaction([
        prisma.request.update({ where: { uniqueCode }, data: { status: 'BILLED' } }),
        prisma.bill.create({
          data: { requestId: existingRequest.id, amount: quote.amount },
        }),
      ]);

      return res.status(200).json(updatedRequest);
    }

    const updatedRequest = await prisma.request.update({
      where: { uniqueCode },
      data: { status },
    });

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong updating the request' });
  }
}

module.exports = { createQuote, getQuoteByCode, getAllQuotes, updateQuoteStatus };