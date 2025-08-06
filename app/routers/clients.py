from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from fastapi.responses import JSONResponse
from app.db import get_session

router = APIRouter(prefix="/reports/clients", tags=["Clients"])

@router.get("", response_class=JSONResponse)
async def list_clients(session: AsyncSession = Depends(get_session)):
    sql = """
    SELECT DISTINCT cl.clientid, cl.name AS client_name
    FROM "default".tblclient cl
    JOIN "default".tblclientenv ce ON ce.clientid = cl.clientid
    JOIN "default".tblcompany c ON c.companyid = ce.companyid
    WHERE c.active = true
    ORDER BY cl.name;
    """
    result = await session.execute(text(sql))
    rows = result.mappings().all()
    return JSONResponse(rows)