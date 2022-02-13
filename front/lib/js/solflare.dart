import 'dart:typed_data';

import 'package:js/js.dart';
import 'package:nft_game/js/solana_web3/transaction.dart';
import 'package:nft_game/js/solana_web3/public_key.dart';

@JS('wallet.solflare.connect')
external Future<PublicKey> connect();

@JS('wallet.solflare.disconnect')
external Future<PublicKey> disconnect();

@JS('wallet.solflare.isInstalled')
external bool? isInstalled();

@JS('wallet.solflare.signTransaction')
external Future<String> signTransaction(Transaction tx);

@anonymous
@JS('wallet.solflare.SignedMessage')
class SignedMessage {
  external factory SignedMessage({Uint8List signature, PublicKey publicKey});
  external Uint8List get signature;
  external PublicKey get publicKey;
}

@JS('wallet.solflare.signMessage')
external Future<SignedMessage> signMessage(String msg);
