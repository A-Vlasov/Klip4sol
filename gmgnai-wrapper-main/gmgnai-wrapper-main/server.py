from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from gmgn import gmgn
import json
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).resolve().parent.parent.parent / 'rugcheck-master' / 'rugcheck'))
try:
    from rugcheck import rugcheck as rugcheck_class
except ImportError:
    rugcheck_class = None

app = FastAPI()

# Разрешаем CORS для всех источников включая Chrome расширения
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Разрешаем все origins
        "chrome-extension://*",  # Chrome расширения
        "chrome-extension://",  # Chrome расширения (без wildcard)
        "http://localhost:*",  # Локальная разработка
        "http://127.0.0.1:*",  # Локальная разработка
        "https://localhost:*",  # Локальная разработка HTTPS
        "https://127.0.0.1:*",  # Локальная разработка HTTPS
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=[
        "*",
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "Origin",
        "X-Requested-With",
        "User-Agent",
        "Referer",
        "Cache-Control",
        "Pragma",
    ],
    expose_headers=["*"],
)

gmgn_client = gmgn()

@app.get("/api/token/{address}")
def get_token_info(address: str):
    print(f"[Server] GET /api/token/{address}")
    try:
        data = gmgn_client.getTokenInfo(address)
        print(f"[Server] Token info response: {json.dumps(data, indent=2)}")
        return data
    except Exception as e:
        print(f"[Server] Error in get_token_info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/token/{address}/top-buyers")
def get_top_buyers(address: str):
    print(f"[Server] GET /api/token/{address}/top-buyers")
    try:
        data = gmgn_client.getTopBuyers(address)
        print(f"[Server] Top buyers response: {json.dumps(data, indent=2)}")
        return data
    except Exception as e:
        print(f"[Server] Error in get_top_buyers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/token/{address}/security")
def get_security_info(address: str):
    print(f"[Server] GET /api/token/{address}/security")
    try:
        data = gmgn_client.getSecurityInfo(address)
        print(f"[Server] Security info response: {json.dumps(data, indent=2)}")
        return data
    except Exception as e:
        print(f"[Server] Error in get_security_info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/token/{address}/price")
def get_token_price(address: str):
    print(f"[Server] GET /api/token/{address}/price")
    try:
        data = gmgn_client.getTokenUsdPrice(address)
        print(f"[Server] Price response: {json.dumps(data, indent=2)}")
        return data
    except Exception as e:
        print(f"[Server] Error in get_token_price: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/rugcheck/{address}")
async def get_rugcheck_data(address: str):
    """
    Получить данные безопасности от rugcheck.xyz
    """
    print(f"[Server] GET /api/rugcheck/{address}")
    try:
        async with httpx.AsyncClient() as client:
            # Попробуем разные endpoints
            urls_to_try = [
                f"https://api.rugcheck.xyz/api/v1/check/{address}",
                f"https://rugcheck.xyz/api/v1/check/{address}",
                f"https://api.rugcheck.xyz/check/{address}",
                f"https://rugcheck.xyz/check/{address}"
            ]
            
            for url in urls_to_try:
                try:
                    print(f"[Server] Trying rugcheck URL: {url}")
                    response = await client.get(
                        url,
                        headers={
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        timeout=5.0
                    )
                    print(f"[Server] Rugcheck response status: {response.status_code}")
                    print(f"[Server] Rugcheck response headers: {response.headers}")
                    if response.status_code == 200:
                        data = response.json()
                        print(f"[Server] Rugcheck success with URL: {url}")
                        print(f"[Server] Rugcheck response: {json.dumps(data, indent=2)}")
                        return data
                    else:
                        print(f"[Server] Rugcheck failed with status {response.status_code}: {response.text}")
                except Exception as e:
                    print(f"[Server] Rugcheck failed with URL {url}: {e}")
                    continue
            
            # Если все URL не работают, возвращаем безопасные значения
            fallback_data = {
                "status": "unknown",
                "score": 0,
                "risk_factors": [],
                "message": "Unable to check security status - all endpoints failed"
            }
            print(f"[Server] Returning fallback rugcheck data: {json.dumps(fallback_data, indent=2)}")
            return fallback_data
    except Exception as e:
        print(f"[Server] General rugcheck error: {e}")
        fallback_data = {
            "status": "unknown",
            "score": 0,
            "risk_factors": [],
            "message": "Unable to check security status"
        }
        print(f"[Server] Returning error fallback: {json.dumps(fallback_data, indent=2)}")
        return fallback_data

def _map_status(rugcheck_status: str) -> str:
    """Преобразует статусы rugcheck в формат фронтенда"""
    status_mapping = {
        'Good': 'safe',
        'Warning': 'caution', 
        'Danger': 'danger',
        'unknown': 'unknown'
    }
    return status_mapping.get(rugcheck_status, 'unknown')

@app.get("/api/token/{address}/rugcheck")
def get_rugcheck_status(address: str):
    print(f"[Server] GET /api/token/{address}/rugcheck (local python wrapper)")
    if rugcheck_class is None:
        return {"status": "unknown", "score": 0, "risks": [], "message": "Rugcheck module not found"}
    try:
        rc = rugcheck_class(address)
        # Проверяем, что объект создался корректно и имеет необходимые атрибуты
        if not hasattr(rc, 'tokenMeta') or rc.tokenMeta is None:
            return {"status": "unknown", "score": 0, "risks": [], "message": "Token metadata not available"}
        
        summary = rc.summary
        # Проверяем, что summary не None и содержит необходимые поля
        if not summary or not hasattr(summary, 'get'):
            return {"status": "unknown", "score": 0, "risks": [], "message": "Invalid rugcheck response"}
        
        return {
            "status": _map_status(summary.get("result", "unknown")),
            "score": summary.get("riskScore", 0),
            "risks": summary.get("risks", []),
            "rugged": summary.get("rugged", False),
            "mint": summary.get("mint", address),
            "name": summary.get("name", ""),
            "symbol": summary.get("symbol", ""),
            "liquidity": summary.get("totalMarketLiquidity", 0),
            "detectedAt": summary.get("detectedAt", None),
            "links": summary.get("links", []),
        }
    except Exception as e:
        print(f"[Server] Error in get_rugcheck_status: {e}")
        return {"status": "unknown", "score": 0, "risks": [], "message": str(e)}

@app.get("/api/token/{address}/analysis")
def get_token_analysis(address: str):
    """
    Комплексный анализ токена (все данные одним запросом)
    """
    print(f"[Server] GET /api/token/{address}/analysis")
    try:
        info = gmgn_client.getTokenInfo(address)
        buyers = gmgn_client.getTopBuyers(address)
        security = gmgn_client.getSecurityInfo(address)
        price = gmgn_client.getTokenUsdPrice(address)
        
        result = {
            "info": info,
            "top_buyers": buyers,
            "security": security,
            "price": price
        }
        print(f"[Server] Analysis response: {json.dumps(result, indent=2)}")
        return result
    except Exception as e:
        print(f"[Server] Error in get_token_analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 