const prisma = require('../lib/prisma');

async function createServiceRequest(req, res) {
  try {
    const { uniqueCode, issue } = req.body;

    if (!uniqueCode || !issue) {
      return res.status(400).json({ error: 'uniqueCode and issue are required' });
    }

    const request = await prisma.request.findUnique({
      where: { uniqueCode },
      include: { bill: true },
    });

    if (!request) {
      return res.status(404).json({ error: 'No request found with that code' });
    }

    if (!request.bill) {
      return res.status(400).json({ error: 'Service requests can only be raised for a billed request' });
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        requestId: request.id,
        issue,
      },
    });

    res.status(201).json(serviceRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong creating the service request' });
  }
}

async function getAllServiceRequests(req, res) {
  try {
    const { status } = req.query;

    const serviceRequests = await prisma.serviceRequest.findMany({
      where: status ? { status } : {},
      include: { request: { include: { customer: true, bill: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(serviceRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching service requests' });
  }
}

async function getServiceRequestById(req, res) {
  try {
    const { id } = req.params;

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: Number(id) },
      include: { request: { include: { customer: true, bill: true } } },
    });

    if (!serviceRequest) {
      return res.status(404).json({ error: 'No service request found with that id' });
    }

    res.status(200).json(serviceRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching the service request' });
  }
}

async function updateServiceRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'APPROVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value for a service request' });
    }

    const existing = await prisma.serviceRequest.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'No service request found with that id' });
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong updating the service request' });
  }
}

module.exports = {
  createServiceRequest,
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceRequestStatus,
};