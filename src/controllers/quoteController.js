const prisma = require('../lib/prisma');
const generateUniqueCode = require('../lib/generateUniqueCode');

async function createQuote(req, res) {
  try {
    const { customerId, power, backup, phase } = req.body;

    if (!customerId || !power || !backup || !phase) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const uniqueCode = generateUniqueCode();

    const newRequest = await prisma.request.create({
      data: {
        uniqueCode,
        power,
        backup,
        phase,
        customerId,
      },
    });

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
      include: { quote: true, bill: true },
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
      include: { customer: true, quote: true, bill: true },
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
    const { status, amount, items, pdfUrl, pdfPublicId } = req.body;

    const validStatuses = ['PENDING', 'QUOTED', 'APPROVED', 'BILLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const existingRequest = await prisma.request.findUnique({ where: { uniqueCode } });
    if (!existingRequest) {
      return res.status(404).json({ error: 'No request found with that code' });
    }

    if (status === 'QUOTED') {
      if (!amount || !items || !pdfUrl || !pdfPublicId) {
        return res.status(400).json({ error: 'amount, items, pdfUrl, and pdfPublicId are required to send a quote' });
      }

      const [updatedRequest] = await prisma.$transaction([
        prisma.request.update({ where: { uniqueCode }, data: { status: 'QUOTED' } }),
        prisma.quote.create({
          data: { requestId: existingRequest.id, amount, items, pdfUrl, pdfPublicId },
        }),
      ]);

      return res.status(200).json(updatedRequest);
    }

    if (status === 'BILLED') {
      if (!amount || !pdfUrl || !pdfPublicId) {
        return res.status(400).json({ error: 'amount, pdfUrl, and pdfPublicId are required to create a bill' });
      }

      const [updatedRequest] = await prisma.$transaction([
        prisma.request.update({ where: { uniqueCode }, data: { status: 'BILLED' } }),
        prisma.bill.create({
          data: { requestId: existingRequest.id, amount, pdfUrl, pdfPublicId },
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