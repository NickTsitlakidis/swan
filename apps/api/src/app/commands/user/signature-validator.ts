import { Injectable } from "@nestjs/common";
import { decode } from "bs58";
import { sign_detached_verify } from "tweetnacl-ts";
import { bufferToHex, ecrecover, fromRpcSig, hashPersonalMessage, publicToAddress, toBuffer } from "ethereumjs-util";

@Injectable()
export class SignatureValidator {
    validateSolanaSignature(signature: string, address: string, message: string): boolean {
        const decodedSignature = decode(signature);
        const encodedNonce = new TextEncoder().encode(message);
        const pubKey = decode(address);
        try {
            return sign_detached_verify(encodedNonce, decodedSignature, pubKey);
        } catch {
            return false;
        }
    }

    validateEthereumSignature(signature: string, address: string, message: string): boolean {
        const authenticationHexMessage = toBuffer(bufferToHex(Buffer.from(message)));
        const messageHash = hashPersonalMessage(authenticationHexMessage);
        const signatureParams = fromRpcSig(signature);
        const publicKey = ecrecover(messageHash, signatureParams.v, signatureParams.r, signatureParams.s);
        const addressBuffer = publicToAddress(publicKey);
        const signatureAddress = bufferToHex(addressBuffer);

        // The signature verification is successful if the address found with
        // ecrecover matches the initial publicAddress
        return signatureAddress.toLowerCase() === address;
    }
}
