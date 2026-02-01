package geoip

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type GeoResponse struct {
	Country string `json:"country"`
	Status  string `json:"status"`
}

// GetCountryFromIP fetches the country name for a given IP address using ip-api.com
func GetCountryFromIP(ip string) string {
	if ip == "127.0.0.1" || ip == "::1" || ip == "" {
		return "Nigeria" // Default to Nigeria for local dev
	}

	url := fmt.Sprintf("http://ip-api.com/json/%s?fields=status,country", ip)
	client := &http.Client{Timeout: 5 * time.Second}

	resp, err := client.Get(url)
	if err != nil {
		fmt.Printf("GeoIP Error: %v\n", err)
		return "Nigeria"
	}
	defer resp.Body.Close()

	var result GeoResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		fmt.Printf("GeoIP Decode Error: %v\n", err)
		return "Nigeria"
	}

	if result.Status != "success" || result.Country == "" {
		return "Nigeria"
	}

	return result.Country
}
